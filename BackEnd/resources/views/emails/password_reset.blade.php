<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    
    <a href="{{ $resetLink }}" style="padding: 10px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
    </a>
    
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 60 minutes.</p>
</body>
</html> 
