<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use App\Models\Level;
use App\Models\BoxQuestionAnswer;
use App\Models\BalloonType;
use App\Models\BalloonAnswer;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Log;

class GameController extends Controller
{
    public function storeGame(Request $request)
    {
        $request->validate([
            'course' => 'required|string',
            'topic' => 'required|string',
            'gameNumber' => 'required|integer',
            'numLevels' => 'required|integer',
            'levels' => 'required|array',
            'user_id' => 'required|integer',
            'game_id' => 'nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            $gameId = $request->input('game_id');
            $userId = $request->input('user_id');

            if ($gameId) {
                // Update existing game
                $game = Game::where('game_id', $gameId)->firstOrFail();
                $game->update([
                    'course' => $request->course,
                    'topic' => $request->topic,
                    'game_number' => $request->gameNumber,
                    'number_of_levels' => $request->numLevels,
                    'user_id' => $userId,
                ]);

                // Delete existing levels and related data
                Level::where('game_id', $game->game_id)->delete();
                
                // Create notification for game update
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'info',
                    'title' => 'Game Updated',
                    'message' => "Your game '{$request->topic}' has been successfully updated.",
                    'read' => false
                ]);
            } else {
                // Create new game
                $game = Game::create([
                    'course' => $request->course,
                    'topic' => $request->topic,
                    'game_number' => $request->gameNumber,
                    'number_of_levels' => $request->numLevels,
                    'user_id' => $userId,
                ]);
                
                // Create notification for new game
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'success',
                    'title' => 'New Game Created',
                    'message' => "You have successfully created a new math game '{$request->topic}'.",
                    'read' => false
                ]);
            }

            // Debugging: Log the game_id
            // Log::info('Game ID after creation/update:', ['game_id' => $game->game_id]);

            foreach ($request->levels as $levelData) {
                // Create the level entry
                $level = Level::create([
                    'game_id' => $game->game_id,
                    'level_number' => $levelData['level_number'],
                    'level_type' => $levelData['level_type'],
                ]);

                if ($levelData['level_type'] === 'box' && isset($levelData['questions'])) {
                    foreach ($levelData['questions'] as $questionData) {
                        // Store question and answer in BoxQuestionAnswer
                        BoxQuestionAnswer::create([
                            'level_id' => $level->id,
                            'question_text' => $questionData['text'],
                            'answer_text' => $questionData['answer'],
                        ]);
                    }
                }

                if ($levelData['level_type'] === 'balloon' && isset($levelData['question'])) {
                    // Create BalloonType entry
                    $balloonType = BalloonType::create([
                        'level_id' => $level->id,
                        'question_text' => $levelData['question'],
                    ]);

                    if (!empty($levelData['answers']) && is_array($levelData['answers'])) {
                        foreach ($levelData['answers'] as $answerData) {
                            BalloonAnswer::create([
                                'balloon_id' => $balloonType->id,
                                'answer_text' => $answerData['text'],
                                'is_correct' => $answerData['is_true'],
                            ]);
                        }
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Game data stored successfully!', 'game_id' => $game->game_id], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('Error storing game data:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
