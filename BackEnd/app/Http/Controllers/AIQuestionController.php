<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Exception;

class AIQuestionController extends Controller
{
    /**
     * Generate questions using AI based on user prompt
     */
    public function generateQuestions(Request $request)
    {
        try {
            \Log::info('🚀 [AIQuestion] Request received');
            \Log::info('📋 Request data:', $request->all());

            $validated = $request->validate([
                'prompt'    => 'required|string|max:1000',
                'game_type' => 'required|in:box,balloon',
                'level'     => 'required|integer|min:1|max:10',
            ]);

            \Log::info('✅ [AIQuestion] Validation passed', $validated);

            $questions = match ($validated['game_type']) {
                'box'     => $this->generateBoxQuestions($validated['prompt']),
                'balloon' => $this->generateBalloonQuestions($validated['prompt']),
            };

            \Log::info('🎉 [AIQuestion] Questions generated:', ['count' => count($questions)]);

            return response()->json([
                'success'   => true,
                'questions' => $questions,
                'message'   => 'Questions generated successfully',
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('❌ [AIQuestion] Validation failed:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            \Log::error('❌ [AIQuestion] Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate questions: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Game-type dispatchers
    // ─────────────────────────────────────────────────────────────────────────

    private function generateBoxQuestions(string $prompt): array
    {
        \Log::info('📦 [AIQuestion] Generating Box type questions');

        $apiKey = env('GROQ_API_KEY');

        if ($apiKey) {
            \Log::info('🌐 [AIQuestion] Using Groq API');
            return $this->callGroqAPI($prompt, 'box', $apiKey);
        }

        \Log::info('📋 [AIQuestion] No Groq key — using mock data');
        return $this->getMockBoxQuestions($prompt);
    }

    private function generateBalloonQuestions(string $prompt): array
    {
        \Log::info('🎈 [AIQuestion] Generating Balloon type questions');

        $apiKey = env('GROQ_API_KEY');

        if ($apiKey) {
            \Log::info('🌐 [AIQuestion] Using Groq API');
            return $this->callGroqAPI($prompt, 'balloon', $apiKey);
        }

        \Log::info('📋 [AIQuestion] No Groq key — using mock data');
        return $this->getMockBalloonQuestions($prompt);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Groq API (OpenAI-compatible)
    // ─────────────────────────────────────────────────────────────────────────

    private function callGroqAPI(string $prompt, string $gameType, string $apiKey): array
    {
        // Models to try in order (each has its own quota)
        $models = [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768',
        ];

        foreach ($models as $model) {
            $result = $this->callGroqModel($apiKey, $model, $prompt, $gameType);
            if ($result !== null) {
                return $result;
            }
            \Log::warning("⚠️ [Groq] Model $model failed — trying next...");
        }

        \Log::warning('⚠️ [Groq] All models exhausted — falling back to mock data');
        return $gameType === 'box'
            ? $this->getMockBoxQuestions($prompt)
            : $this->getMockBalloonQuestions($prompt);
    }

    private function callGroqModel(string $apiKey, string $model, string $prompt, string $gameType): ?array
    {
        if ($gameType === 'box') {
            $systemPrompt = 'You are an educational question generator. Always respond with ONLY valid JSON, no markdown, no explanation.';
            $userPrompt   = 'Generate exactly 5 different educational questions with correct answers about: ' . $prompt
                . '. Return ONLY this JSON format: {"questions": [{"text": "Question?", "answer": "Answer"}, ...]}';
        } else {
            $systemPrompt = 'You are an educational question generator. Always respond with ONLY valid JSON, no markdown, no explanation.';
            $userPrompt   = 'Generate 1 multiple-choice question with exactly 4 answer options (only 1 correct) about: ' . $prompt
                . '. Return ONLY this JSON format: {"question": "Question?", "answers": [{"text": "Option", "is_true": true}, {"text": "Option", "is_true": false}, ...]}';
        }

        try {
            \Log::info("🌐 [Groq] Trying model: $model");

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'       => $model,
                'messages'    => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $userPrompt],
                ],
                'temperature' => 0.7,
                'max_tokens'  => 1000,
            ]);

            \Log::info('📡 [Groq] Response status: ' . $response->status());

            if ($response->successful()) {
                $data    = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? null;

                if (!$content) {
                    \Log::warning('❌ [Groq] Empty content in response');
                    return null;
                }

                \Log::info('📝 [Groq] Raw content: ' . substr($content, 0, 300));

                // Strip markdown code fences if present
                $content = preg_replace('/^```json\s*/i', '', trim($content));
                $content = preg_replace('/\s*```$/', '', $content);
                $content = trim($content);

                $parsed = json_decode($content, true);

                if (json_last_error() !== JSON_ERROR_NONE || !$parsed) {
                    \Log::warning('❌ [Groq] JSON decode error: ' . json_last_error_msg());
                    return null;
                }

                if ($gameType === 'box' && isset($parsed['questions'])) {
                    \Log::info('📦 [Groq] Returning ' . count($parsed['questions']) . ' box questions');
                    return $parsed['questions'];
                }

                if ($gameType === 'balloon' && isset($parsed['question'])) {
                    \Log::info('🎈 [Groq] Returning balloon question');
                    return [$parsed];
                }

                \Log::warning('❌ [Groq] Unexpected JSON structure: ' . json_encode($parsed));
                return null;

            } else {
                \Log::warning("❌ [Groq] Model $model — HTTP " . $response->status());
                \Log::warning('Response: ' . $response->body());
                return null;
            }

        } catch (Exception $e) {
            \Log::error("❌ [Groq] Model $model — Exception: " . $e->getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mock data (fallback)
    // ─────────────────────────────────────────────────────────────────────────

    private function getMockBoxQuestions(string $prompt): array
    {
        \Log::info('🎭 [AIQuestion] Using MOCK data (Box Type)');
        return [
            ['text' => 'What is 2 + 2?',                                              'answer' => '4'],
            ['text' => 'What is the square root of 16?',                              'answer' => '4'],
            ['text' => 'Solve for x: 2x + 5 = 13',                                   'answer' => '4'],
            ['text' => 'What is 10 × 3?',                                             'answer' => '30'],
            ['text' => 'What is the area of a rectangle with length 5 and width 3?',  'answer' => '15'],
        ];
    }

    private function getMockBalloonQuestions(string $prompt): array
    {
        \Log::info('🎭 [AIQuestion] Using MOCK data (Balloon Type)');
        return [
            [
                'question' => 'What is 5 + 3?',
                'answers'  => [
                    ['text' => '6',  'is_true' => false],
                    ['text' => '7',  'is_true' => false],
                    ['text' => '8',  'is_true' => true],
                    ['text' => '9',  'is_true' => false],
                    ['text' => '10', 'is_true' => false],
                    ['text' => '11', 'is_true' => false],
                    ['text' => '12', 'is_true' => false],
                    ['text' => '13', 'is_true' => false],
                    ['text' => '14', 'is_true' => false],
                    ['text' => '15', 'is_true' => false],
                ],
            ],
        ];
    }
}
