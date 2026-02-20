<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RemoveGameController extends Controller
{
    //
    public function deleteGame(Request $request)
    {
        $request->validate([
            'game_id' => 'required|integer|exists:games,game_id',
            'user_id' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            
            $game = Game::where('game_id', $request->game_id)->Where('user_id', $request->user_id)->firstOrFail();
            $game->delete();

            DB::commit();
            return response()->json(['message' => 'Game deleted successfully!', 'payload' => ['game_id: '.$request->game_id, 'user_id: '.$request->user_id]], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
