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
        Schema::create('balloon_answer', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('balloon_id');
            $table->foreign('balloon_id')->references('balloon_id')->on('balloon_type')->onDelete('cascade');
            $table->longText('answer_text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('balloon_answer');
}
};