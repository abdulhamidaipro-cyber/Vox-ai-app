# Workflow: Instagram Reels Downloader + Voice Transcription

**n8n workflow ID:** `dATY8Wn15joAIetP`
**Status:** active
**Two independent webhook endpoints in one workflow.**

---

## Endpoint 1 — Transcribe Voice

Convert an uploaded audio file to text using Google Gemini 2.5 Flash.

| | |
|---|---|
| Method | `POST` |
| URL | `https://n8n.srv1243505.hstgr.cloud/webhook/transcribe-voice` |
| Body | `multipart/form-data` |
| Field name | `data` (must be a file) |
| Required Content-Type per part | `audio/*` (e.g. `audio/wav`, `audio/mpeg`, `audio/ogg`, `audio/webm`, `audio/mp4`) |
| Timeout | up to ~60s for long clips |

### Response (success — 200)
```json
{ "text": "<transcribed text>" }
```
If the audio contains no speech, Gemini returns a sentinel like `"There is no speech in the audio."` — treat as empty transcription on the UI.

### Response (error — non-200)
The Webhook node returns the n8n default error response. Front-end should treat any non-200 as a server error and show a generic retry message.

### curl test
```bash
curl -X POST https://n8n.srv1243505.hstgr.cloud/webhook/transcribe-voice \
  -F "data=@your-clip.wav;type=audio/wav"
```

**Gotcha:** Browser `FormData` auto-sets the per-part Content-Type from the `File` object — no manual work needed in the frontend. The `;type=...` suffix is only needed with `curl`/`Postman`.

---

## Endpoint 2 — Instagram Reel Download

Download an Instagram reel video as binary, via RapidAPI's `instagram-reels-downloader-api`.

| | |
|---|---|
| Method | `POST` |
| URL | `https://n8n.srv1243505.hstgr.cloud/webhook/instagram-reel` |
| Body | `application/json` |
| Schema | `{ "url": "https://www.instagram.com/reel/<id>/" }` |
| Timeout | up to ~60s |

### Response (success — 200)
- Content-Type: `video/mp4` (or whatever RapidAPI returns)
- Body: raw video binary
- Front-end can write straight to a `Blob` and offer download, or feed into a `<video>` element via `URL.createObjectURL`.

### Response (error — 502)
JSON shape:
```json
{
  "error": "Failed to fetch Instagram reel. The downloader service may be temporarily unavailable.",
  "details": { /* upstream error object */ }
}
```
Returned when either:
- The RapidAPI Instagram downloader is down / under maintenance (real example: it was returning HTTP 500 *"The system is undergoing an upgrade"* during the build session)
- The reel URL is invalid, private, or geo-blocked
- The CDN URL fetched from RapidAPI fails

### curl test
```bash
curl -X POST https://n8n.srv1243505.hstgr.cloud/webhook/instagram-reel \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/reel/<id>/"}' \
  -o reel.mp4
```

---

## Workflow internals

```
[Webhook Voice] → [Transcribe a recording (Gemini)] → [Respond Voice]

[Webhook Reel] → [HTTP Request (RapidAPI)] → [Download Reel Video] → [Respond Reel]
                       ↓ error                        ↓ error
                       └──────→ [Respond Reel Error] ←┘
```

| Node | Type | Notes |
|---|---|---|
| `Webhook Voice` | `n8n-nodes-base.webhook` v2 | POST `/transcribe-voice`, response mode `responseNode`, `onError: continueRegularOutput` |
| `Transcribe a recording` | `@n8n/n8n-nodes-langchain.googleGemini` v1.1 | `resource: audio`, `operation: transcribe`, `inputType: binary`, `binaryPropertyName: data`, model `gemini-2.5-flash`. Credential: `googlePalmApi` (`عيادة الاراك`) |
| `Respond Voice` | `n8n-nodes-base.respondToWebhook` v1.5 | `respondWith: json`, body `{ "text": <gemini text> }` |
| `Webhook Reel` | `n8n-nodes-base.webhook` v2 | POST `/instagram-reel`, response mode `responseNode`, `onError: continueRegularOutput` |
| `HTTP Request` | `n8n-nodes-base.httpRequest` v4.3 | GET RapidAPI, `?url=<reel url>`, header `x-rapidapi-host` inline, key via `Header Auth` credential `RapidAPI Instagram Reels` (id `t2M8kAvYULcK4hh1`). `retryOnFail: true`, `maxTries: 2`, `onError: continueErrorOutput` |
| `Download Reel Video` | `n8n-nodes-base.httpRequest` v4.3 | GET `{{ $json.data.medias[0].url }}`, `responseFormat: file`. Same retry/error policy as above |
| `Respond Reel` | `n8n-nodes-base.respondToWebhook` v1.5 | `respondWith: binary`, `inputFieldName: data` — returns the mp4 |
| `Respond Reel Error` | `n8n-nodes-base.respondToWebhook` v1.5 | Returns the 502 error JSON; both HTTP nodes' error outputs connect here |

---

## Credentials referenced

| Credential | Type | Purpose | ID |
|---|---|---|---|
| `عيادة الاراك` | `googlePalmApi` | Gemini API key | `Mj1Xi0jB2uSBCmqD` |
| `RapidAPI Instagram Reels` | `httpHeaderAuth` | Sends `x-rapidapi-key` header to RapidAPI | `t2M8kAvYULcK4hh1` |

---

## Known constraints

- **HTTP Request node is pinned to v4.3.** v4.4 exists in the n8n-mcp catalog but is NOT installed on this n8n server (`2.56.0` self-hosted). Activation fails with `Cannot read properties of undefined (reading 'execute')` if you bump back to v4.4.
- **Gemini audio node = v1.1.** v1.2 was tested and also works for static validation, but v1.1 matches what was originally in the workflow and is what the server runs.
- **RapidAPI provider can be flaky.** The Instagram reels downloader was returning HTTP 500 *"The system is undergoing an upgrade"* during initial smoke testing (2026-05-25). The reel pipeline itself is correct — it just needs the upstream to be healthy. Frontend should surface the 502 error JSON cleanly so users know to retry.
- **No per-IP rate limiting on the n8n webhook.** Add a token check or front-end rate limiter if this gets exposed publicly.

---

## Verification log (2026-05-25)

| Test | Status |
|---|---|
| `n8n_validate_workflow` (runtime profile) | ✅ `valid: true`, 0 errors |
| Workflow active | ✅ `active: true` |
| Voice endpoint with `silence.wav` (1s, 16kHz mono, Content-Type `audio/wav`) | ✅ 200 `{"text":"There is no speech in the audio."}` |
| Reel endpoint with `https://www.instagram.com/reel/DAaG_8XJBwl/` | ⚠️ 502 — upstream RapidAPI returned 500 *"system undergoing an upgrade"*. Pipeline structure verified, awaits upstream recovery for green test. |
