<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BalloonAnswer extends Model
{
    protected $table = 'balloon_answer';
    protected $fillable = ['balloon_id', 'answer_text', 'is_correct'];

    public function balloonType()
    {
        return $this->belongsTo(BalloonType::class, 'balloon_id');
    }
}
