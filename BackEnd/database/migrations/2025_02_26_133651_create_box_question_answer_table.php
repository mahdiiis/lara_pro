<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('box_question_answer', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('box_id');
            // $table->foreign('box_id')->references('box_id')->on('box_type')->onDelete('cascade');
            $table->unsignedBigInteger('level_id');
            $table->foreign('level_id')->references('level_id')->on('levels')->onDelete('cascade');
            $table->longText('question_text');
            $table->longText('answer_text');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('box_question_answer');
}
};