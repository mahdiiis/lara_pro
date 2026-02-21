# AI Question Generator — Debug Log

## Status: ⚠️ Mock data fallback (Gemini quota exhausted)

---

## ✅ What Works

| Item | Status |
|---|---|
| Backend route `POST /api/generate-questions` | ✅ Exists & reachable |
| Laravel Sanctum auth (JWT token) | ✅ Working |
| Test user `test@example.com` / `password` | ✅ Exists in DB |
| Gemini API key in `.env` | ✅ Present (39 chars) |
| Gemini model name `gemini-2.0-flash` | ✅ Recognized |
| Box-type generation | ✅ Works (mock fallback) |
| Balloon-type generation | ✅ Works (mock fallback) |
| JSON parsing of Gemini response | ✅ Logic correct |

---

## ❌ Root Cause

**HTTP 429 — Free-tier daily quota exhausted.**

```
RESOURCE_EXHAUSTED:
  GenerateRequestsPerDayPerProjectPerModel-FreeTier
  GenerateRequestsPerMinutePerProjectPerModel-FreeTier
  GenerateContentInputTokensPerModelPerMinute-FreeTier
  limit: 0, model: gemini-2.0-flash
```

Log evidence: `storage/logs/laravel.log` — `[Gemini] Response status: 429`

---

## Commands Run

```bash
# Check API key in .env
Get-Content .env | Select-String "GEMINI"

# Read last 80 lines of Laravel log
Get-Content storage/logs/laravel.log -Tail 80

# Test auth token
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test box-type generation
curl -X POST http://127.0.0.1:8000/api/generate-questions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"algebra","game_type":"box","level":1}'

# Test balloon-type generation
curl -X POST http://127.0.0.1:8000/api/generate-questions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"algebra","game_type":"balloon","level":1}'
```

---

## Fix Attempts

### Fix 1 — Model name update
Changed model from `gemini-1.5-flash` → `gemini-2.0-flash` in `AIQuestionController.php` line 123.
**Result:** Model recognized ✅ but quota still hit.

### Fix 2 (in progress) — New API key
Replace `GEMINI_API_KEY` in `.env` with a fresh key from:
👉 https://aistudio.google.com/app/apikey

Then run: `php artisan config:clear && php artisan serve`

### Fix 3 (fallback) — Switch to `gemini-1.5-flash-8b`
Higher free-tier limits. Change model name in `AIQuestionController.php` line 123:
```php
$model = 'gemini-1.5-flash-8b';
```

---

## Files Changed

| File | Change |
|---|---|
| `BackEnd/app/Http/Controllers/AIQuestionController.php` | Model name: `gemini-1.5-flash` → `gemini-2.0-flash` |
| `BackEnd/.env` | `GEMINI_API_KEY` = set (key exists) |
