<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BalloonType extends Model
{
    protected $table = 'balloon_type';
    protected $fillable = ['level_id', 'question_text'];

    public function level()
    {
        return $this->belongsTo(Level::class, 'level_id');
    }

    public function answers()
    {
        return $this->hasMany(BalloonAnswer::class, 'balloon_id');
    }
}
