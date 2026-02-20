<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    protected $fillable = [
        'game_id',
        'level_number',
        'level_type',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

	
    public function boxQuestionAnswer()
    {
        return $this->hasMany(BoxQuestionAnswer::class, 'level_id');
    }
	
    // Relationship to BalloonType
    public function balloonType()
    {
        return $this->hasMany(BalloonType::class, 'level_id');
    }
}
