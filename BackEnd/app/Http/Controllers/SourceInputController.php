<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;

class SourceInputController extends Controller
{
    // Maximum file size: 5 MB
    const MAX_FILE_SIZE_KB = 5120;

    // Maximum extracted text length (chars) sent to AI
    const MAX_TEXT_LENGTH = 6000;

    // =========================================================
    //  FILE EXTRACTION
    // =========================================================

    /**
     * Extract readable text from an uploaded file (PDF, TXT, DOCX).
     */
    public function extractFromFile(Request $request)
    {
        \Log::info('📄 [SourceInput] File extraction request received.');

        $request->validate([
            'file' => [
                'required',
                'file',
                'max:' . self::MAX_FILE_SIZE_KB,
                'mimes:txt,pdf,docx,doc',
            ],
        ], [
            'file.max'   => 'File is too large. Maximum size is 5 MB.',
            'file.mimes' => 'Unsupported file type. Please upload a PDF, TXT, or DOCX file.',
        ]);

        $file = $request->file('file');
        $ext  = strtolower($file->getClientOriginalExtension());

        \Log::info("📄 [SourceInput] File: {$file->getClientOriginalName()}, Ext: {$ext}");

        try {
            $text = match (true) {
                $ext === 'txt'                   => $this->extractFromTxt($file),
                $ext === 'pdf'                   => $this->extractFromPdf($file),
                in_array($ext, ['docx', 'doc']) => $this->extractFromDocx($file),
                default                          => null,
            };

            if ($text === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unsupported file type. Please upload a PDF, TXT, or DOCX file.',
                ], 422);
            }

            $text = $this->cleanAndTruncate($text);

            if (empty(trim($text))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not extract any text from this file. The file may be empty or image-only.',
                ], 422);
            }

            \Log::info('✅ [SourceInput] File extracted. Length: ' . strlen($text));

            return response()->json([
                'success' => true,
                'text'    => $text,
                'length'  => strlen($text),
            ], 200);

        } catch (\Exception $e) {
            \Log::error('❌ [SourceInput] File extraction error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse the file: ' . $e->getMessage(),
            ], 500);
        }
    }

    // =========================================================
    //  URL EXTRACTION  (supports regular pages + YouTube)
    // =========================================================

    /**
     * Dispatcher: detects YouTube URLs and routes accordingly,
     * otherwise falls back to generic webpage extraction.
     */
    public function extractFromUrl(Request $request)
    {
        \Log::info('🔗 [SourceInput] URL extraction request received.');

        $request->validate([
            'url' => 'required|url|max:2048',
        ], [
            'url.url' => 'Please enter a valid URL (including http:// or https://).',
        ]);

        $url     = trim($request->input('url'));
        $videoId = $this->extractYoutubeVideoId($url);

        \Log::info("🔗 [SourceInput] URL: {$url}" . ($videoId ? " → YouTube ID: {$videoId}" : ''));

        if ($videoId) {
            return $this->handleYoutube($videoId);
        }

        return $this->handleWebpage($url);
    }

    // =========================================================
    //  YOUTUBE SUPPORT
    // =========================================================

    /**
     * Parse a YouTube video ID from any URL variant.
     * Supports: youtube.com/watch?v=, youtu.be/, /shorts/, /embed/, /live/
     */
    private function extractYoutubeVideoId(string $url): ?string
    {
        $patterns = [
            '/(?:youtube\.com\/watch\?.*?v=)([a-zA-Z0-9_-]{11})/',
            '/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/',
            '/(?:youtube\.com\/(?:embed|shorts|live)\/)([a-zA-Z0-9_-]{11})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Extract transcript/captions from a YouTube video.
     *
     * Strategy (tried in order):
     * 1. YouTube's public timedtext list API → fetch best track (most reliable, no API key)
     * 2. ytInitialPlayerResponse JSON embedded in the watch page (secondary fallback)
     * 3. Video title + description only (last resort — very limited, flagged as warning)
     */
    private function handleYoutube(string $videoId): \Illuminate\Http\JsonResponse
    {
        \Log::info("🎬 [SourceInput] Extracting YouTube content for video: {$videoId}");

        $title = null;

        // ─────────────────────────────────────────────────────────────────────
        // TIER 1: Direct timedtext list API (public, no auth required)
        // YouTube exposes a caption track listing at:
        // https://www.youtube.com/api/timedtext?type=list&v={VIDEO_ID}
        // which returns an XML list of available caption tracks.
        // ─────────────────────────────────────────────────────────────────────
        $transcript = $this->fetchViaTimedtextApi($videoId);

        if ($transcript !== null) {
            \Log::info('✅ [Tier-1] Transcript via timedtext API. Length: ' . strlen($transcript));

            // Fetch title separately from a lightweight oembed call
            $title = $this->fetchYoutubeTitleViaOembed($videoId);

            $fullText = ($title ? "Video Title: {$title}\n\n" : '') . "COURSE TRANSCRIPT:\n{$transcript}";
            $fullText = $this->cleanAndTruncate($fullText);

            return response()->json([
                'success' => true,
                'text'    => $fullText,
                'length'  => strlen($fullText),
                'source'  => 'youtube_transcript',
            ], 200);
        }

        \Log::warning('⚠️ [Tier-1] Timedtext API returned no transcript. Trying page-scrape (Tier-2).');

        // ─────────────────────────────────────────────────────────────────────
        // TIER 2: Fetch watch page and parse ytInitialPlayerResponse JSON
        // ─────────────────────────────────────────────────────────────────────
        try {
            $pageResponse = Http::timeout(15)
                ->withHeaders([
                    'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language' => 'fr-FR,fr;q=0.9,en;q=0.8',
                    'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])
                ->get("https://www.youtube.com/watch?v={$videoId}");

            if ($pageResponse->successful()) {
                $html        = $pageResponse->body();
                $title       = $this->youtubeTitle($html);
                $description = $this->youtubeDescription($html);
                $captionUrl  = $this->youtubeCaptionUrl($html, ['fr', 'en', 'ar', 'es', 'de']);

                if ($captionUrl) {
                    \Log::info('[Tier-2] Caption URL from ytInitialPlayerResponse.');
                    $captionResp = Http::timeout(10)->get($captionUrl);

                    if ($captionResp->successful()) {
                        $transcript = $this->parseCaptionXml($captionResp->body());

                        if (!empty(trim($transcript))) {
                            $fullText = ($title ? "Video Title: {$title}\n\n" : '') . "COURSE TRANSCRIPT:\n{$transcript}";
                            $fullText = $this->cleanAndTruncate($fullText);

                            \Log::info('✅ [Tier-2] Transcript via page-scrape. Length: ' . strlen($fullText));

                            return response()->json([
                                'success' => true,
                                'text'    => $fullText,
                                'length'  => strlen($fullText),
                                'source'  => 'youtube_transcript',
                            ], 200);
                        }
                    }
                }

                // ─────────────────────────────────────────────────────────────
                // TIER 3: Title + description fallback — very limited content
                // Return an error instead of silently generating shallow questions
                // ─────────────────────────────────────────────────────────────
                \Log::warning('⚠️ [Tier-3] No captions available. Falling back to description.');

                $fallback = '';
                if ($title)       $fallback .= "Video Title: {$title}\n\n";
                if ($description) $fallback .= "Video Description:\n{$description}";

                if (empty(trim($fallback))) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This video has no captions/subtitles enabled. Try a video that has auto-generated or manual subtitles (check if CC button appears on YouTube).',
                    ], 422);
                }

                $fallback = $this->cleanAndTruncate($fallback);

                return response()->json([
                    'success' => true,
                    'text'    => $fallback,
                    'length'  => strlen($fallback),
                    'source'  => 'youtube_description',
                    'notice'  => '⚠️ No transcript found — only the video title & description were extracted. Questions may be generic. Use a video with CC/subtitles for better results.',
                ], 200);
            }

        } catch (\Exception $e) {
            \Log::error('❌ YouTube extraction error: ' . $e->getMessage());
        }

        return response()->json([
            'success' => false,
            'message' => 'Could not extract content from this YouTube video. Make sure it is public and has captions enabled.',
        ], 422);
    }

    /**
     * TIER 1: Use YouTube's public timedtext XML API.
     *
     * 1. GET /api/timedtext?type=list&v={ID} → XML list of available tracks.
     * 2. Pick the best language track.
     * 3. GET the track URL → parse XML segments into text.
     *
     * Returns null if no captions are available.
     */
    private function fetchViaTimedtextApi(string $videoId): ?string
    {
        $preferredLangs = ['fr', 'en', 'ar', 'es', 'de'];

        try {
            // Step 1: get list of available tracks
            $listUrl  = "https://www.youtube.com/api/timedtext?type=list&v={$videoId}";
            $listResp = Http::timeout(8)->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible)',
            ])->get($listUrl);

            if (!$listResp->successful() || empty(trim($listResp->body()))) {
                \Log::info('[Tier-1] timedtext list API returned nothing.');
                return null;
            }

            $listXml = $listResp->body();
            \Log::info('[Tier-1] timedtext list received. Parsing tracks...');

            // Parse available tracks: <track id="..." name="..." lang_code="fr" ... />
            preg_match_all('/<track[^>]+lang_code="([^"]+)"[^>]*(?:name="([^"]*)"|)[^>]*\/>/i', $listXml, $trackMatches, PREG_SET_ORDER);

            // Also look for ASR (auto-generated) tracks
            $tracks = [];
            foreach ($trackMatches as $m) {
                $tracks[] = ['lang' => $m[1], 'name' => $m[2] ?? ''];
            }

            if (empty($tracks)) {
                \Log::info('[Tier-1] No tracks in timedtext list XML.');
                return null;
            }

            \Log::info('[Tier-1] Available tracks: ' . json_encode(array_column($tracks, 'lang')));

            // Step 2: pick best language
            $chosenLang = null;
            $chosenName = '';
            foreach ($preferredLangs as $lang) {
                foreach ($tracks as $track) {
                    if (str_starts_with($track['lang'], $lang)) {
                        $chosenLang = $track['lang'];
                        $chosenName = $track['name'];
                        break 2;
                    }
                }
            }
            // Fall back to first available track
            if (!$chosenLang) {
                $chosenLang = $tracks[0]['lang'];
                $chosenName = $tracks[0]['name'];
            }

            \Log::info("[Tier-1] Chosen track: lang={$chosenLang}, name={$chosenName}");

            // Step 3: fetch the caption track
            $captionUrl = "https://www.youtube.com/api/timedtext?v={$videoId}&lang={$chosenLang}";
            if (!empty($chosenName)) {
                $captionUrl .= '&name=' . urlencode($chosenName);
            }

            $captionResp = Http::timeout(10)->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible)',
            ])->get($captionUrl);

            if (!$captionResp->successful() || empty(trim($captionResp->body()))) {
                \Log::warning('[Tier-1] Caption track request failed or empty.');
                return null;
            }

            $transcript = $this->parseCaptionXml($captionResp->body());

            return !empty(trim($transcript)) ? $transcript : null;

        } catch (\Exception $e) {
            \Log::warning('[Tier-1] timedtext API exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Fetch video title via YouTube's oEmbed endpoint (lightweight, no API key).
     */
    private function fetchYoutubeTitleViaOembed(string $videoId): ?string
    {
        try {
            $resp = Http::timeout(5)->get(
                'https://www.youtube.com/oembed?url=' . urlencode("https://www.youtube.com/watch?v={$videoId}") . '&format=json'
            );
            return $resp->successful() ? ($resp->json('title') ?? null) : null;
        } catch (\Exception) {
            return null;
        }
    }

    /**
     * Find the best caption track URL from ytInitialPlayerResponse JSON embedded in the page.
     */
    private function youtubeCaptionUrl(string $html, array $preferredLangs = ['en']): ?string
    {
        if (!preg_match('/ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var |const |let |\w+\s*=)/s', $html, $matches)) {
            return null;
        }

        $data   = json_decode($matches[1], true);
        $tracks = $data['captions']['playerCaptionsTracklistRenderer']['captionTracks'] ?? [];

        if (empty($tracks)) return null;

        foreach ($preferredLangs as $lang) {
            foreach ($tracks as $track) {
                if (str_starts_with($track['languageCode'] ?? '', $lang)) {
                    return $track['baseUrl'] ?? null;
                }
            }
        }

        return $tracks[0]['baseUrl'] ?? null;
    }

    /**
     * Convert YouTube timed-text XML to a plain text transcript.
     */
    private function parseCaptionXml(string $xml): string
    {
        $text = '';
        preg_match_all('/<text[^>]*>(.*?)<\/text>/s', $xml, $matches);

        foreach ($matches[1] as $segment) {
            $text .= ' ' . trim(html_entity_decode($segment, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        }

        return trim($text);
    }

    /** Extract og:title or <title> from YouTube page. */
    private function youtubeTitle(string $html): ?string
    {
        if (preg_match('/<meta\s+property="og:title"\s+content="([^"]+)"/i', $html, $m)) {
            return html_entity_decode($m[1], ENT_QUOTES, 'UTF-8');
        }
        if (preg_match('/<title>([^<]+)<\/title>/i', $html, $m)) {
            return html_entity_decode(str_replace(' - YouTube', '', $m[1]), ENT_QUOTES, 'UTF-8');
        }
        return null;
    }

    /** Extract og:description from YouTube page. */
    private function youtubeDescription(string $html): ?string
    {
        if (preg_match('/<meta\s+(?:name|property)="(?:og:)?description"\s+content="([^"]+)"/i', $html, $m)) {
            return html_entity_decode($m[1], ENT_QUOTES, 'UTF-8');
        }
        return null;
    }

    // =========================================================
    //  GENERIC WEBPAGE EXTRACTION
    // =========================================================

    /**
     * Fetch a regular webpage and extract its main readable text.
     * Uses browser-like headers to reduce bot-blocking (403/429 errors).
     */
    private function handleWebpage(string $url): \Illuminate\Http\JsonResponse
    {
        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'User-Agent'                => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept'                    => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language'           => 'en-US,en;q=0.9',
                    'Accept-Encoding'           => 'gzip, deflate',
                    'Connection'                => 'keep-alive',
                    'Upgrade-Insecure-Requests' => '1',
                ])
                ->get($url);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => "URL not accessible (HTTP {$response->status()}). Some websites block automated access.",
                ], 422);
            }

            $text = $this->extractTextFromHtml($response->body(), $url);
            $text = $this->cleanAndTruncate($text);

            if (empty(trim($text))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not extract readable text from this URL. The page may be mostly JavaScript or images.',
                ], 422);
            }

            \Log::info('✅ Webpage extracted. Length: ' . strlen($text));

            return response()->json([
                'success' => true,
                'text'    => $text,
                'length'  => strlen($text),
                'source'  => 'webpage',
            ], 200);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not connect to the URL. Check the address and try again.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch URL: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Use Symfony DomCrawler to strip noise and return main content text.
     */
    private function extractTextFromHtml(string $html, string $url = ''): string
    {
        try {
            $crawler = new Crawler($html, $url);

            // Strip noise
            $crawler->filter('script, style, nav, footer, header, aside, form, iframe, noscript')->each(function (Crawler $node) {
                foreach ($node as $domNode) {
                    $domNode->parentNode?->removeChild($domNode);
                }
            });

            // Try semantic containers first (best content density)
            foreach (['article', 'main', '[role="main"]', '.post-content', '.entry-content', '#content', '.content'] as $selector) {
                try {
                    $node = $crawler->filter($selector);
                    if ($node->count() > 0) {
                        $text = trim($node->first()->text(null, false));
                        if (strlen($text) > 200) return $text;
                    }
                } catch (\Exception) {}
            }

            // Generic fallback
            $parts = [];
            $crawler->filter('h1, h2, h3, h4, p, li, blockquote, td, pre')->each(function (Crawler $node) use (&$parts) {
                $t = trim($node->text(null, false));
                if (strlen($t) > 30) $parts[] = $t;
            });

            return implode("\n\n", $parts);

        } catch (\Exception $e) {
            \Log::warning('DomCrawler failed, stripping tags: ' . $e->getMessage());
            return strip_tags($html);
        }
    }

    // =========================================================
    //  FILE PARSERS
    // =========================================================

    private function extractFromTxt($file): string
    {
        return file_get_contents($file->getRealPath());
    }

    private function extractFromPdf($file): string
    {
        $pdf = (new \Smalot\PdfParser\Parser())->parseFile($file->getRealPath());
        return $pdf->getText();
    }

    private function extractFromDocx($file): string
    {
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($file->getRealPath());
        $text    = '';

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText() . "\n";
                } elseif (method_exists($element, 'getElements')) {
                    foreach ($element->getElements() as $child) {
                        if (method_exists($child, 'getText')) {
                            $text .= $child->getText() . ' ';
                        }
                    }
                    $text .= "\n";
                }
            }
        }

        return $text;
    }

    // =========================================================
    //  SHARED UTILITY
    // =========================================================

    private function cleanAndTruncate(string $text): string
    {
        $text = preg_replace('/\r\n|\r/', "\n", $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        $text = trim($text);

        if (strlen($text) > self::MAX_TEXT_LENGTH) {
            $text = substr($text, 0, self::MAX_TEXT_LENGTH) . '... [text truncated for AI processing]';
        }

        return $text;
    }
}
