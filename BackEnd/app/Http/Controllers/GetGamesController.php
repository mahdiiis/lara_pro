<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Game;
use App\Models\Level;
use App\Models\BoxQuestionAnswer;
use App\Models\BalloonType;
use App\Models\BalloonAnswer;

class GetGamesController extends Controller
{
    // Method to get all games
    public function getGames(Request $request)
    {
        DB::beginTransaction();
        try {
            $userId = $request->input('user_id');
            if (!$userId) {
                throw new \Exception('User ID not found');
            }

            $userExists = DB::table('users')->where('id', $userId)->exists();
            if (!$userExists) {
                throw new \Exception('User not found in the database');
            }
            $games = Game::where('user_id', $userId)->get();

            DB::commit();
            return response()->json(['message' => 'Games selected successfully!', 'data' => $games], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Method to get the last six created games
    public function getLastCreatedGames(Request $request, $limit = 6)
    {
        DB::beginTransaction();
        try {
            // Fetch the last created games, ordered by creation date
            $userId = $request->input('user_id');
            if (!$userId) {
                throw new \Exception('User ID not found');
            }
            $lastCreatedGames = Game::where('user_id', $userId)->orderBy('created_at', 'desc')->take($limit)->get();

            // Format the data
            $formattedGames = $lastCreatedGames->map(function ($game) {
                return [
                    'quiz_id' => $game->game_id,
                    'timestamp' => $game->created_at,
                    'title' => "{$game->course} - {$game->topic} - Game #{$game->game_number}",
                    'number_of_levels' => $game->number_of_levels,
                ];
            });

            DB::commit();
            return response()->json(['message' => 'Last created games fetched successfully!', 'data' => $formattedGames], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
	
	public function getGameById(Request $request)
    {
        // Validate the request data
        $data = $request->validate([
            'game_id' => 'required|integer',
            'user_id' => 'required|integer',
        ]);

        // Find the game by ID
        $game = Game::find($data['game_id']);

        // Check if the game exists and belongs to the user
        if (!$game || $game->user_id != $data['user_id']) {
            return response()->json([
                'message' => 'Game and user relation validation failed.',
            ], 400);
        }

        // Fetch all levels for the game
        $levels = Level::where('game_id', $game->game_id)->get();

        // Prepare the response data
        $responseData = [
            'course' => $game->course,
            'topic' => $game->topic,
            'gameNumber' => $game->game_number,
            'numLevels' => $game->number_of_levels,
            'levels' => $levels->map(function ($level) {
                $levelData = [
                    'level_number' => $level->level_number,
                    'level_stats' => [
                        'coins' => 0,
                        'lifes' => 5,
                        'mistakes' => 0,
                        'stars' => 1,
                        'time_spent' => 0,
                    ],
                    'level_type' => $level->level_type,
                ];

                // Fetch questions and answers based on level type
                if ($level->level_type === 'box') {
                    $boxQuestions = BoxQuestionAnswer::where('level_id', $level->level_id)->get();
                    $levelData['questions'] = $boxQuestions->map(function ($question) {
                        return [
                            'text' => $question->question_text,
                            'answer' => $question->answer_text,
                        ];
                    })->toArray(); // Convert collection to array
                } elseif ($level->level_type === 'balloon') {
                    $balloonType = BalloonType::where('level_id', $level->level_id)->first();
                    $levelData['question'] = $balloonType ? $balloonType->question_text : null;
                    $levelData['answers'] = $balloonType ? BalloonAnswer::where('balloon_id', $balloonType->balloon_id)
                        ->get()
                        ->map(function ($answer) {
                            return [
                                'text' => $answer->answer_text,
                                'is_true' => $answer->is_correct,
                            ];
                        })->toArray() : []; // Convert collection to array
                }

                return $levelData;
            })->toArray(), // Convert collection to array
            'player_info' => [
                'current_level' => 1,
                'lives' => 3,
                'score' => 0,
            ],
        ];

        return response()->json($responseData, 200);
    }
}
