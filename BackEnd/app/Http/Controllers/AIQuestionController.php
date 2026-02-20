<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Exception;

class AIQuestionController extends Controller
{
    /**
     * Generate questions using AI based on user prompt
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateQuestions(Request $request)
    {
        try {
            \Log::info('🚀 [AIQuestion] Request received');
            \Log::info('📋 Request data:', $request->all());

            $validated = $request->validate([
                'prompt' => 'required|string|max:1000',
                'game_type' => 'required|in:box,balloon',
                'level' => 'required|integer|min:1|max:10',
            ]);

            \Log::info('✅ [AIQuestion] Validation passed', $validated);

            // Generate questions based on game type
            $questions = match ($validated['game_type']) {
                'box' => $this->generateBoxQuestions($validated['prompt']),
                'balloon' => $this->generateBalloonQuestions($validated['prompt']),
            };

            \Log::info('🎉 [AIQuestion] Questions generated:', ['count' => count($questions)]);

            return response()->json([
                'success' => true,
                'questions' => $questions,
                'message' => 'Questions generated successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('❌ [AIQuestion] Validation failed:', $e->errors());

            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            \Log::error('❌ [AIQuestion] Error: ' . $e->getMessage());
            \Log::error('Stack trace:', ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate questions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate questions for BOX game type
     * Returns array of questions with text and answer
     *
     * @param string $prompt User's prompt for AI
     * @return array
     */
    private function generateBoxQuestions(string $prompt): array
    {
        $apiKey = env('GEMINI_API_KEY');

        \Log::info('📦 [AIQuestion] Generating Box type questions');
        \Log::info('🔑 Gemini API Key configured:', ['has_key' => !!$apiKey]);

        if ($apiKey) {
            // Use Gemini API
            \Log::info('🌐 [AIQuestion] Using Google Gemini API');
            return $this->callGeminiAPI($prompt, 'box');
        } else {
            // Fallback to mock data for testing/development
            \Log::info('📋 [AIQuestion] No Gemini key, using mock data');
            return $this->getMockBoxQuestions($prompt);
        }
    }

    /**
     * Generate questions for BALLOON game type
     * Returns array with a single question and multiple answers
     *
     * @param string $prompt User's prompt for AI
     * @return array
     */
    private function generateBalloonQuestions(string $prompt): array
    {
        $apiKey = env('GEMINI_API_KEY');

        \Log::info('🎈 [AIQuestion] Generating Balloon type questions');
        \Log::info('🔑 Gemini API Key configured:', ['has_key' => !!$apiKey]);

        if ($apiKey) {
            // Use Gemini API
            \Log::info('🌐 [AIQuestion] Using Google Gemini API');
            return $this->callGeminiAPI($prompt, 'balloon');
        } else {
            // Fallback to mock data for testing/development
            \Log::info('📋 [AIQuestion] No Gemini key, using mock data');
            return $this->getMockBalloonQuestions($prompt);
        }
    }

    /**
     * Call Google Gemini API to generate questions
     *
     * @param string $prompt User's prompt
     * @param string $gameType Type of game ('box' or 'balloon')
     * @return array Generated questions
     */
    private function callGeminiAPI(string $prompt, string $gameType): array
    {
        $apiKey = env('GEMINI_API_KEY');
        $model = 'gemini-1.5-flash';

        if ($gameType === 'box') {
            $instruction = 'Generate exactly 5 different, clear, and educational questions with their correct answers about: ' . $prompt . '. Make questions progressively challenging and directly related to the topic. Return ONLY valid JSON with no markdown, no extra text. Format: {"questions": [{"text": "Question?", "answer": "Answer"}, ...]}';
        } else {
            $instruction = 'Generate 1 challenging question with exactly 4 different multiple choice answers (only 1 correct) about: ' . $prompt . '. The correct answer and wrong answers should be clearly differentiated. Return ONLY valid JSON with no markdown, no extra text. Format: {"question": "Question?", "answers": [{"text": "Option", "is_true": true/false}, ...]}';
        }

        try {
            \Log::info('🌐 [Gemini] Calling API with key: ' . substr($apiKey, 0, 20) . '...');
            \Log::info('📝 [Gemini] Instruction: ' . substr($instruction, 0, 100) . '...');

            $response = Http::post(
                "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey",
                [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $instruction
                                ]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.8,
                        'maxOutputTokens' => 1500,
                    ]
                ]
            );

            \Log::info('📡 [Gemini] Response status: ' . $response->status());

            if ($response->successful()) {
                $data = $response->json();
                \Log::info('✅ [Gemini] Response received');

                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    $content = $data['candidates'][0]['content']['parts'][0]['text'];
                    \Log::info('📝 [Gemini] Content: ' . substr($content, 0, 200) . '...');

                    // Clean up the response content (remove markdown code blocks if present)
                    $content = preg_replace('/```json\n?|\n?```/', '', $content);
                    $content = trim($content);

                    $parsed = json_decode($content, true);

                    if (json_last_error() === JSON_ERROR_NONE && $parsed) {
                        \Log::info('✅ [Gemini] JSON parsed successfully');
                        if ($gameType === 'box' && isset($parsed['questions'])) {
                            \Log::info('📦 [Gemini] Returning box questions: ' . count($parsed['questions']));
                            return $parsed['questions'];
                        } elseif ($gameType === 'balloon' && isset($parsed['question'])) {
                            \Log::info('🎈 [Gemini] Returning balloon question');
                            return [$parsed];
                        } else {
                            \Log::warning('❌ [Gemini] JSON missing expected format');
                            \Log::warning('Parsed data: ' . json_encode($parsed));
                        }
                    } else {
                        \Log::warning('❌ [Gemini] JSON decode error: ' . json_last_error_msg());
                    }
                } else {
                    \Log::warning('❌ [Gemini] Response missing expected structure');
                    \Log::warning('Response data: ' . json_encode($data));
                }
            } else {
                \Log::warning('❌ [Gemini] API Error: ' . $response->status());
                \Log::warning('Response body: ' . $response->body());
                // Fallback to mock if API fails
                return $gameType === 'box' ? $this->getMockBoxQuestions($prompt) : $this->getMockBalloonQuestions($prompt);
            }
        } catch (Exception $e) {
            \Log::error('❌ [Gemini] Exception: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            // Fallback to mock if exception occurs
            return $gameType === 'box' ? $this->getMockBoxQuestions($prompt) : $this->getMockBalloonQuestions($prompt);
        }

        \Log::warning('⚠️ [Gemini] Falling back to mock data');
        return $gameType === 'box' ? $this->getMockBoxQuestions($prompt) : $this->getMockBalloonQuestions($prompt);
    }

    /**
     * Get mock box type questions for testing
     *
     * @param string $prompt User's prompt (used for context)
     * @return array Mock questions
     */
    private function getMockBoxQuestions(string $prompt): array
    {
        \Log::info('🎭 [AIQuestion] Using MOCK data (Box Type)');

        return [
            [
                'text' => 'What is 2 + 2?',
                'answer' => '4'
            ],
            [
                'text' => 'What is the square root of 16?',
                'answer' => '4'
            ],
            [
                'text' => 'Solve for x: 2x + 5 = 13',
                'answer' => '4'
            ],
            [
                'text' => 'What is 10 × 3?',
                'answer' => '30'
            ],
            [
                'text' => 'What is the area of a rectangle with length 5 and width 3?',
                'answer' => '15'
            ]
        ];
    }

    /**
     * Get mock balloon type questions for testing
     * Returns 1 question with up to 10 possible answer options
     * Uses is_true field to match original project architecture
     *
     * @param string $prompt User's prompt (used for context)
     * @return array Mock questions (with single question containing multiple answers)
     */
    private function getMockBalloonQuestions(string $prompt): array
    {
        \Log::info('🎭 [AIQuestion] Using MOCK data (Balloon Type)');

        return [
            [
                'question' => 'What is 5 + 3?',
                'answers' => [
                    ['text' => '6', 'is_true' => false],
                    ['text' => '7', 'is_true' => false],
                    ['text' => '8', 'is_true' => true],
                    ['text' => '9', 'is_true' => false],
                    ['text' => '10', 'is_true' => false],
                    ['text' => '11', 'is_true' => false],
                    ['text' => '12', 'is_true' => false],
                    ['text' => '13', 'is_true' => false],
                    ['text' => '14', 'is_true' => false],
                    ['text' => '15', 'is_true' => false]
                ]
            ]
        ];
    }
}
