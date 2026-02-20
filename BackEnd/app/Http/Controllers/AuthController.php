<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Login;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller {
    // REGISTER USER
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
        ], 201);
    }

    // LOGIN USER
    public function login(Request $request) {
        // Implement rate limiting for login attempts
        if (RateLimiter::tooManyAttempts('login:'.$request->ip(), 5)) {
            $seconds = RateLimiter::availableIn('login:'.$request->ip());
            
            return response()->json([
                'error' => 'Too many login attempts. Please try again in '.$seconds.' seconds.',
            ], 429);
        }
        
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Increment the rate limiter on failed login
            RateLimiter::hit('login:'.$request->ip());
            
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Reset the rate limiter on successful login
        RateLimiter::clear('login:'.$request->ip());

        // Record the login
        Login::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        // Check if remember me option is set
        $tokenExpiration = $request->input('rememberMe', false) ? 
            now()->addDays(30) :  // 30 days for persistent login
            now()->addHours(24);  // 24 hours for regular login

        // Create token with expiration
        $token = $user->createToken('auth_token', [], $tokenExpiration)->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // LOGOUT USER
    public function logout(Request $request) {
        // Delete all tokens for the user for complete security
        $request->user()->tokens()->delete();
        
        // Log the logout event for auditing
        Log::info('User logged out', [
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    // GET AUTHENTICATED USER
    public function user(Request $request) {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request) {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|required|string|min:8|confirmed',
            'profile_image' => 'sometimes|required|string',
        ]);

        $data = [];
        $sensitiveDataChanged = false;

        if ($request->has('name')) {
            $data['name'] = $request->name;
        }

        if ($request->has('email')) {
            $data['email'] = $request->email;
            $sensitiveDataChanged = true;
        }
        
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
            $sensitiveDataChanged = true;
        }

        if ($request->has('profile_image')) {
            $data['profile_image'] = $request->profile_image;
        }

        $user->update($data);
        
        // Create notification for account update
        Notification::create([
            'user_id' => $user->id,
            'type' => 'success',
            'title' => 'Account Updated',
            'message' => 'Your account settings have been updated successfully.',
            'read' => false
        ]);
        
        // Rotate tokens if sensitive information was changed
        if ($sensitiveDataChanged) {
            // Store current token for response
            $currentToken = $request->bearerToken();
            
            // Revoke all other tokens
            $user->tokens()->where('token', '!=', $currentToken)->delete();
            
            // Create a new token
            $newToken = $user->createToken('auth_token', [], now()->addHours(24))->plainTextToken;
            
            // Log the security event
            Log::info('User profile updated with sensitive data changes', [
                'user_id' => $user->id,
                'ip_address' => $request->ip()
            ]);
            
            return response()->json([
                'message' => 'Profile updated successfully. For security reasons, you have been issued a new token.',
                'user' => $user,
                'token' => $newToken
            ]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    // FORGOT PASSWORD
    public function forgotPassword(Request $request) {
        Log::info('Forgot password request received', [
            'email' => $request->email,
            'ip' => $request->ip()
        ]);

        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        
        // If user doesn't exist, still return success for security
        if (!$user) {
            Log::info('Password reset requested for non-existent email: ' . $request->email);
            return response()->json([
                'message' => 'If that email address is in our system, we have sent a password reset link.',
                'debug_info' => 'No user found with this email address. This message is only for development.',
                'status' => 'email_not_found'
            ]);
        }
        
        // Generate a random token
        $token = bin2hex(random_bytes(32));
        
        // Store the token with expiration (1 hour from now)
        $user->password_reset_token = $token;
        $user->password_reset_expires_at = now()->addHour();
        $user->save();
        
        // Build the reset URL
        $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
       
	   // send email 
		try {
			$email = $request->email; 
        Mail::send('emails.password_reset', ['resetLink' => $resetUrl], function($message) use ($email) {
            $message->to($email)
                    ->subject('Password Reset Request');
        });
        
        return response()->json([
        'status' => 'success',
        'message' => 'Password reset email sent successfully!'
    ], 200);
        
    } catch (\Exception $e) {
    Log::error('Password reset email failed: ' . $e->getMessage());
    return response()->json([
        'status' => 'error',
        'message' => 'Failed to send password reset email. Please try again later.'
    ], 500);
    }
	
	// 
        Log::info('Generated password reset URL: ' . $resetUrl);
        
        // For development: return the token directly in the response
        return response()->json([
            'message' => 'Password reset link generated successfully',
            'debug_info' => 'DEVELOPMENT MODE: Reset token returned directly',
            'reset_url' => $resetUrl,
            'status' => 'success'
        ]);
    }
    
    // RESET PASSWORD
    public function resetPassword(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        $user = User::where('email', $request->email)
                    ->where('password_reset_token', $request->token)
                    ->where('password_reset_expires_at', '>', now())
                    ->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired password reset token.'
            ], 400);
        }
        
        // Update the user's password
        $user->password = Hash::make($request->password);
        $user->password_reset_token = null;
        $user->password_reset_expires_at = null;
        $user->save();
        
        // Create a notification
        Notification::create([
            'user_id' => $user->id,
            'type' => 'success',
            'title' => 'Password Reset',
            'message' => 'Your password has been reset successfully.',
            'read' => false
        ]);
        
        Log::info('Password reset successful for user: ' . $user->email);
        
        return response()->json([
            'message' => 'Password has been reset successfully.'
        ]);
    }
}
