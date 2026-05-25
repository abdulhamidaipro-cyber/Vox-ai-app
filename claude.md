# n8n → App

Convert n8n workflows into deployable web apps.

## Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- n8n via Webhook nodes
- Deploy: GitHub → Vercel

## Core Principle
The frontend never calls n8n directly. Every request goes through a Next.js API route (`app/api/[workflow]/route.ts`) that acts as a proxy. This hides webhook URLs and tokens from the browser, allows validation/auth, and avoids CORS issues.

---

## Phase 1: Verify the workflow is app-ready

Before writing any frontend code, validate the n8n workflow:

1. **Trigger**: Use a `Webhook node` (not Manual Trigger). Define HTTP method and path.
2. **Input schema**: Document expected fields (`name`, `type`, `required`) in `n8n/<workflow-name>.md`.
3. **Output**: Final node must be `Respond to Webhook` returning structured JSON.
4. **Manual test** with curl or Postman first:
   - Input arrives correctly?
   - Output is well-formed JSON?
   - Errors return proper status codes?
5. **Record** in `n8n/<workflow-name>.md`: webhook URL, input shape, output shape, error codes.

**Do not move to Phase 2 until every step passes.**

---

## Phase 2: Build the app

1. **Scaffold** (if not done): `npx create-next-app@latest` with TypeScript, Tailwind, App Router.
2. **API route** at `app/api/<workflow>/route.ts`: receives from frontend, calls n8n webhook, returns the result.
3. **UI** at `app/<workflow>/page.tsx` + shared components in `components/`.
4. **Env vars** in `.env.local` (gitignored):
   ```
   N8N_WEBHOOK_<NAME>=https://...
   N8N_AUTH_TOKEN=...
   ```
5. **Local testing**: `npm run dev` → test golden path + error cases.
6. **Push to GitHub**: `git init` → push to repo.
7. **Deploy to Vercel**: link repo + copy `.env.local` values into Vercel Environment Variables.

---

## Project Structure

```
n8n to app/
├── app/
│   ├── api/<workflow>/route.ts    # proxy per workflow
│   ├── <workflow>/page.tsx        # page per workflow
│   └── layout.tsx
├── components/                    # shared UI
├── lib/
│   ├── n8n.ts                     # helper for n8n webhook calls
│   └── types.ts                   # shared TypeScript types
├── n8n/                           # workflow docs (markdown + JSON exports)
│   └── <workflow-name>.md
├── .env.local                     # gitignored
├── .env.example                   # template, no values
└── claude.md
```

## Working Rules

- **Always start with Phase 1.** No frontend code until the n8n workflow is tested.
- **One markdown file per workflow** in `n8n/`: documents input/output schema.
- **Only API routes talk to n8n.** The frontend only calls `/api/...`.
- **Never commit `.env.local`.** Update `.env.example` instead.
- **TypeScript types per workflow** in `lib/types.ts` (must match n8n schema).

## MCPs

All MCPs are user-scoped (in `~/.claude.json`, not in project files). Credentials live in Windows user env vars.

| MCP | When to use |
|---|---|
| **n8n-mcp** (czlonkowski) | Phase 1 work: inspect n8n workflows, read node configs, validate workflows, search node docs, manage executions. The primary tool for everything n8n-related. |
| **github** (official) | Phase 2 deploy step: create repos, push code, manage PRs/issues, set up Actions. |
| **claude.ai n8n** | Built-in lightweight n8n integration. Prefer `n8n-mcp` instead — it's more capable. |

## Skills

All skills are user-scoped in `~/.claude/skills/`. They activate automatically when relevant.

**n8n skills** (use during Phase 1):
- `n8n-mcp-tools-expert` — meta-skill for using n8n-mcp effectively
- `n8n-workflow-patterns` — common workflow design patterns
- `n8n-node-configuration` — how to configure specific nodes
- `n8n-expression-syntax` — n8n expression language ({{ }})
- `n8n-validation-expert` — validate workflows before running
- `n8n-code-javascript` — write Code nodes in JavaScript
- `n8n-code-python` — write Code nodes in Python

**Frontend skill** (use during Phase 2):
- `frontend-design` — create distinctive, production-grade UIs (avoids generic AI aesthetics)

## Security Notes

- Secrets (n8n API key, GitHub PAT) are in Windows user env vars: `N8N_API_URL`, `N8N_API_KEY`, `GITHUB_PAT`.
- Never log, echo, or commit these values.
- The future Next.js app uses `.env.local` (gitignored) for its own runtime secrets — separate from MCP credentials.
