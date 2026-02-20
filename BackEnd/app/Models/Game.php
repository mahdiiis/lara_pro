<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $primaryKey = 'game_id';
    protected $fillable = [
        'course',
        'topic',
        'game_number',
        'number_of_levels',
        'game_id',
        'user_id',
    ];

    public function levels()
    {
        return $this->hasMany(Level::class, 'game_id');
    }
}
