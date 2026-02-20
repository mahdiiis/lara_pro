<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoxQuestionAnswer extends Model
{
    protected $table = 'box_question_answer';
    protected $fillable = ['level_id', 'question_text', 'answer_text'];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}
