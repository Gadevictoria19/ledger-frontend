# General Ledger Engine - Frontend

The web frontend for **General Ledger Engine**, a multi-agent bank reconciliation system. This app lets a user upload a bank statement CSV, kicks off an automated reconciliation run against ERP records, and visualises the agent pipeline as it verifies and balances the ledger.


## What it does

- **Landing page** — introduces the architecture with an animated agent-communication log simulating a live reconciliation run.
- **Upload page** (`/upload`) — drag-and-drop or sample CSV upload of bank transactions, parsed client-side and handed off to the reconciliation flow.
- **Dashboard** (`/dashboard`) — displays the reconciliation results: verified transactions, flagged discrepancies, and ledger balance status.

## Architecture

This repo is the UI layer only. It's designed to sit in front of a backend pipeline built around:

| Layer | Role |
|---|---|
| **Processor Agent** | Maps raw transactions to ledger account codes |
| **Auditor Agent (CoVe)** | Independently re-derives every mapping via Chain-of-Verification before it's trusted |
| **Python Sandbox** | Validates penny-exact double-entry (`assert DR == CR`) using `Decimal` arithmetic — no float drift, no silent rounding |
| **LangGraph Orchestration** | Manages agent state across the full run so no context is dropped mid-reconciliation |

## Tech stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide icons, PapaParse (CSV parsing)
- **Backend (companion service):** Python 3.11, FastAPI, Claude API, LangGraph, PostgreSQL, Pydantic

## Getting started

```bash
# install dependencies
npm install

# run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for production

```bash
npm run build
npm run start
```

## Project structure

```
app/
  page.tsx              # Landing page
  layout.tsx            # Root layout & metadata
  globals.css           # Global styles / design tokens
  upload/page.tsx        # CSV upload & parsing flow
  dashboard/page.tsx     # Reconciliation results dashboard
```

## Deployment

Deployed on [Vercel](https://vercel.com). Pushes to `main` trigger a production deployment automatically.

## License

MIT
