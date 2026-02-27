<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Http\Controllers\RemoveGameController;
use App\Http\Controllers\GetGamesController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AIQuestionController;
use App\Http\Controllers\SourceInputController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
Route::post('/game', [GameController::class, 'storeGame']);
Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::get('/select', [GetGamesController::class, 'getGames']);
Route::get('/lastGames', [GetGamesController::class, 'getLastCreatedGames']);
Route::delete('/delete', [RemoveGameController::class, 'deleteGame']);
Route::get('/getGameById', [GetGamesController::class, 'getGameById']);

// Password Reset Routes
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// AI Question Generator Route (Protected)
Route::post('/generate-questions', [AIQuestionController::class, 'generateQuestions'])->middleware('auth:sanctum');

// Source Input Routes (Protected)
Route::post('/extract-file', [SourceInputController::class, 'extractFromFile'])->middleware('auth:sanctum');
Route::post('/extract-url',  [SourceInputController::class, 'extractFromUrl'])->middleware('auth:sanctum');

// Notification Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::post('/notifications', [NotificationController::class, 'create']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);
    Route::delete('/notifications', [NotificationController::class, 'deleteAll']);
});

/*
    // test Api avec React POST axios
     
Route::get('/test', function () {
    return response()->json([
        'message' => 'hello laravel',
        'version' => app()->version(),
    ]);
});


Route::get('/addition/{n1?}/{n2?}', function (int $n1 = null, int $n2 = null) {
    if($n1 === null || $n2 === null) {
        return response()->json('Write something to do the operation +');
    }
    else {
        return response()->json("$n1 + $n2 = ". $n1 + $n2);
    }
});
*/
