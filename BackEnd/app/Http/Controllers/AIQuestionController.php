<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Exception;

class AIQuestionController extends Controller
{
    public function generateQuestions(Request $request)
    {
        \Log::info('🚀 [AIQuestion] Bulk generation request received');
        \Log::info('📋 Request data:', $request->all());

        $validated = $request->validate([
            'course'        => 'required|string|max:100',
            'topic'         => 'required|string|max:100',
            'gameNumber'    => 'required|integer|min:1',
            'numLevels'     => 'required|integer|min:1|max:6',
            'level_types'   => 'required|array',
            'level_types.*' => 'required|in:box,balloon',
            'ai_prompt'     => 'required|string|max:1000',
            'source_text'   => 'nullable|string|max:8000', // Optional extracted text from file/URL
        ]);

        if (count($validated['level_types']) !== $validated['numLevels']) {
            return response()->json([
                'success' => false,
                'message' => 'Le nombre de types doit correspondre au nombre de niveaux'
            ], 422);
        }

        $numLevels = $validated['numLevels'];
        $levelTypes = $validated['level_types'];

        $systemPrompt = "Tu es un professeur de mathématiques expert du système scolaire MAROCAIN pour l'école primaire. Langage simple pour enfants 8-12 ans. Exemples concrets du quotidien marocain. TU RÉPONDS TOUJOURS EN JSON VALIDE UNIQUEMENT.";

        $levelsDescription = "";
        for ($i = 0; $i < $numLevels; $i++) {
            $levelNum = $i + 1;
            $type = $levelTypes[$i];
            
            if ($type === 'box') {
                $levelsDescription .= "- Niveau {$levelNum} : TYPE BOX → 5 questions avec UNE réponse courte chacune\n";
            } else {
                $levelsDescription .= "- Niveau {$levelNum} : TYPE BALLOON → 1 question avec 10 réponses (vrai/faux)\n";
            }
        }

       // Build the source text injection (if provided)
        $sourceTextSection = '';
        if (!empty($validated['source_text'])) {
            $sourceTextSection = "
=== TEXTE SOURCE (CONTENU DU COURS) ===
{$validated['source_text']}
=== FIN DU TEXTE SOURCE ===

INSTRUCTIONS STRICTES POUR LE TEXTE SOURCE :
- Tu DOIS baser tes questions UNIQUEMENT sur le contenu réel du texte source ci-dessus.
- Les questions doivent porter sur les CONCEPTS, les RÈGLES, les EXEMPLES et les FAITS présents dans ce texte.
- Il est INTERDIT de poser des questions sur le titre de la vidéo/document, le nom de l'auteur, le niveau mentionné dans le titre, ou toute autre métadonnée.
- Il est INTERDIT de faire référence à \"la vidéo\", \"le titre\", \"le document\" ou \"le texte\" dans les questions. Formule les questions directement sur le savoir, comme si c'était le prof qui interroge l'élève après le cours.
- Exemple INTERDIT : \"Qu'est-ce qui est mentionné dans le titre ?\", \"Quel niveau est cité dans la vidéo ?\"
- Exemple CORRECT : \"Combien font 3/4 + 1/4 ?\", \"Quelle fraction est équivalente à 1/2 ?\"
";
        }

       $userPrompt = "
{$sourceTextSection}
Le professeur demande : \"{$validated['ai_prompt']}\"

INFORMATIONS :
Cours : {$validated['course']}
Sujet : {$validated['topic']}

GÉNÈRE EXACTEMENT {$numLevels} NIVEAUX :
{$levelsDescription}

DIFFICULTÉ PROGRESSIVE :
- Niveau 1 : facile
- Niveau {$numLevels} : difficile

IMPORTANT : Tu DOIS répondre avec UNIQUEMENT ce JSON, rien d'autre. Pas de texte avant, pas de texte après. Juste le JSON.

Voici le format JSON EXACT que tu dois respecter (exemple pour 2 niveaux box et balloon) :

{
    \"levels\": [
        {
            \"level_number\": 1,
            \"level_type\": \"box\",
            \"level_stats\": {
                \"coins\": 0,
                \"lifes\": 5,
                \"mistakes\": 0,
                \"stars\": 1,
                \"time_spent\": 0
            },
            \"questions\": [
                {
                    \"text\": \"Combien font 2 + 2 ?\",
                    \"answer\": \"4\"
                },
                {
                    \"text\": \"5 × 3 = ?\",
                    \"answer\": \"15\"
                },
                {
                    \"text\": \"10 ÷ 2 = ?\",
                    \"answer\": \"5\"
                },
                // ... (génère les 2 autres questions ici pour faire exactement 5)
            ]
        },
        {
            \"level_number\": 2,
            \"level_type\": \"balloon\",
            \"level_stats\": {
                \"coins\": 0,
                \"lifes\": 5,
                \"mistakes\": 0,
                \"stars\": 1,
                \"time_spent\": 0
            },
            \"question\": \"Quelle fraction représente la moitié ?\",
            \"answers\": [
                {
                    \"text\": \"1/2\",
                    \"is_true\": true
                },
                {
                    \"text\": \"1/3\",
                    \"is_true\": false
                },
                {
                    \"text\": \"2/4\",
                    \"is_true\": true
                },
                {
                    \"text\": \"1/5\",
                    \"is_true\": false
                },
                // ... (génère les 6 autres réponses ici pour faire exactement 10)
            ]
        }
    ]
}

Génère maintenant les {$numLevels} niveaux demandés en suivant EXACTEMENT ce format.
        ";

        try {
            $apiKey = env('GROQ_API_KEY');
            
            if (!$apiKey) {
                \Log::warning('⚠️ GROQ_API_KEY is missing. Using fallback mock data.');
                return $this->getMockBulkData($validated);
            }

            \Log::info('🌐 [AIQuestion] Calling Groq API matching user provided script...');
            
            $modelsToTry = [
                'llama-3.1-8b-instant',
                'llama-3.3-70b-versatile',
                'mixtral-8x7b-32768'
            ];

            $response = null;
            $usedModel = '';

            foreach ($modelsToTry as $model) {
                \Log::info("🔄 Trying Groq API with model: {$model}");
                
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type'  => 'application/json',
                ])->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model'       => $model,
                    'messages'    => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt]
                    ],
                    'temperature' => 0.7,
                    'max_tokens'  => 3000,
                ]);

                if ($response->successful()) {
                    $usedModel = $model;
                    break; 
                } else {
                    $status = $response->status();
                    $body = $response->body();
                    \Log::warning("⚠️ Groq Model {$model} failed. Status: {$status}. Body: {$body}");
                }
            }

            if (!$response || !$response->successful()) {
                throw new \Exception('All Groq models failed or rate-limited.');
            }

            $result  = $response->json();
            $content = $result['choices'][0]['message']['content'];
            
            \Log::info("RAW AI CONTENT ($usedModel):\n" . $content);

            $content = preg_replace('/```json\s*|\s*```/', '', trim($content));
            $aiData = json_decode($content, true);

            if (!$aiData || !isset($aiData['levels'])) {
                \Log::error("❌ Invalid JSON received: " . $content);
                return response()->json([
                    'success' => false,
                    'message' => 'Format JSON invalide reçu de l\'IA. Réessaie.'
                ], 500);
            }

            if (count($aiData['levels']) !== $numLevels) {
                \Log::warning("⚠️ L'IA a généré " . count($aiData['levels']) . " niveaux au lieu de {$numLevels}.");
                return response()->json([
                    'success' => false,
                    'message' => "L'IA a généré " . count($aiData['levels']) . " niveaux au lieu de {$numLevels}."
                ], 500);
            }

            \Log::info("✅ [AIQuestion] Successfully generated all levels.");

            return response()->json([
                'success' => true,
                'data'    => [
                    'course'      => $validated['course'],
                    'topic'       => $validated['topic'],
                    'gameNumber'  => $validated['gameNumber'],
                    'numLevels'   => $validated['numLevels'],
                    'levels'      => $aiData['levels'],
                    'player_info' => [
                        'current_level' => 1,
                        'lives'         => 3,
                        'score'         => 0
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('❌ [AIQuestion] Exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage()
            ], 500);
        }
    }

    private function getMockBulkData(array $validated): \Illuminate\Http\JsonResponse
    {
        $levels = [];
        for ($i = 0; $i < $validated['numLevels']; $i++) {
            $type = $validated['level_types'][$i];
            $levels[] = [
                'level_number' => $i + 1,
                'level_type' => $type,
                'level_stats' => [
                    'coins' => 0,
                    'lifes' => 5,
                    'mistakes' => 0,
                    'stars' => 1,
                    'time_spent' => 0
                ],
                'questions' => $type === 'box' ? [
                    ['text' => 'MOCK 1+1 ?', 'answer' => '2'],
                    ['text' => 'MOCK 2+2 ?', 'answer' => '4'],
                    ['text' => 'MOCK 3+3 ?', 'answer' => '6'],
                    ['text' => 'MOCK 4+4 ?', 'answer' => '8'],
                    ['text' => 'MOCK 5+5 ?', 'answer' => '10'],
                ] : null,
                'question' => $type === 'balloon' ? 'MOCK Quelle fraction représente la moitié ?' : null,
                'answers' => $type === 'balloon' ? [
                    ['text' => '1/2', 'is_true' => true],
                    ['text' => '1/3', 'is_true' => false],
                    ['text' => '2/4', 'is_true' => true],
                    ['text' => '1/5', 'is_true' => false],
                    ['text' => '2/5', 'is_true' => false],
                    ['text' => '3/5', 'is_true' => false],
                    ['text' => '4/5', 'is_true' => false],
                    ['text' => '1/6', 'is_true' => false],
                    ['text' => '2/6', 'is_true' => false],
                    ['text' => '3/6', 'is_true' => true],
                ] : null,
            ];
            
            // Cleanup nulls so json is clean
            $levels[$i] = array_filter($levels[$i], function($value) { return $value !== null; });
        }

        return response()->json([
            'success' => true,
            'message' => 'Mocked data (No API Key)',
            'data' => [
                'course' => $validated['course'],
                'topic' => $validated['topic'],
                'gameNumber' => $validated['gameNumber'],
                'numLevels' => $validated['numLevels'],
                'levels' => $levels,
                'player_info' => [
                    'current_level' => 1,
                    'lives' => 3,
                    'score' => 0
                ]
            ]
        ], 200);
    }
}
