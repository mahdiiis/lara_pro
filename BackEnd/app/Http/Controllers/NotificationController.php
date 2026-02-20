<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function getNotifications()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
                'notifications' => []
            ], 401);
        }
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'notifications' => $notifications
        ]);
    }
    
    /**
     * Create a new notification
     */
    public function create(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,success,warning',
            'user_id' => 'required|exists:users,id'
        ]);
        
        $notification = Notification::create([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type,
            'read' => false
        ]);
        
        return response()->json([
            'message' => 'Notification created successfully',
            'notification' => $notification
        ], 201);
    }
    
    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        $notification = Notification::where('user_id', $user->id)->find($id);
        
        if (!$notification) {
            return response()->json([
                'message' => 'Notification not found'
            ], 404);
        }
        
        $notification->update(['read' => true]);
        
        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        Notification::where('user_id', $user->id)->update(['read' => true]);
        
        return response()->json([
            'message' => 'All notifications marked as read'
        ]);
    }
    
    /**
     * Delete a notification
     */
    public function delete($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        $notification = Notification::where('user_id', $user->id)->find($id);
        
        if (!$notification) {
            return response()->json([
                'message' => 'Notification not found'
            ], 404);
        }
        
        $notification->delete();
        
        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }
    
    /**
     * Delete all notifications
     */
    public function deleteAll()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        Notification::where('user_id', $user->id)->delete();
        
        return response()->json([
            'message' => 'All notifications deleted successfully'
        ]);
    }
    
    /**
     * System notifications for game creation, updates, etc.
     * This can be called from other controllers
     */
    public static function createSystemNotification($userId, $title, $message, $type = 'info')
    {
        Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'read' => false
        ]);
    }
}
