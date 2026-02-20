<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name', 'email', 'password', 'profile_image', 'password_reset_token', 'password_reset_expires_at'
    ];

    protected $hidden = [
        'password', 'remember_token', 'password_reset_token', 'password_reset_expires_at'
    ];

    public function games()
    {
        return $this->hasMany(Game::class);
    }
    
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
