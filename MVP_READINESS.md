# MVP and beta readiness review

Review date: 2026-07-14

## Decision

**Internal MVP: ready for deployment testing. External medical beta: conditional go after the launch blockers below are closed.**

The application builds cleanly and its implemented flows are coherent. The remaining blockers require credentials, data regeneration, deployment infrastructure, legal/operator details, or human clinical evaluation and therefore cannot be completed safely in source code alone.

## Launch blockers

1. **Revoke and rotate the exposed pipeline provider key.** A live-looking key was hard-coded in `/root/papers/pipeline/config.py`. It has been removed, but source edits cannot revoke an already exposed credential.
2. **Regenerate and evaluate the corpus.** The current database contains 7,184 paper rows and 3,419 summaries produced by the earlier pipeline. Re-run a representative golden set with pipeline `2026-07-14.2`, complete independent expert review, then regenerate approved content, ingest it with provenance, and rebuild Qdrant before describing the new prompt/gate behavior as deployed.
3. **Measure medical safety independently.** The 85.3% figure is the old pipeline model checking its own output, not clinician review. Establish acceptance thresholds for unsupported claims, numerical mismatches, source-quote grounding, causal overstatement, and false verifier passes across human, animal, laboratory, review, and guideline papers.
4. **Complete production configuration.** Set production secrets, secure cookies, exact origins/admins, SMTP/reset URL, database credentials, Qdrant authentication/network isolation, backups, and restore drills. Run an end-to-end test on the real HTTPS topology.
5. **Apply the database migration.** Run `backend/migrations/001_beta_hardening.sql` before deploying against an existing PostgreSQL database.
6. **Finish operational monitoring.** Structured request/pipeline logs and readiness endpoints now exist, but they must be shipped to monitored storage with alerting, retention, dashboards, and an incident owner.
7. **Finalize legal/privacy operations.** The beta pages accurately describe the current implementation, but the operator identity, monitored privacy/support contact, processor list, regions, retention periods, and jurisdiction-specific counsel review are still required.

## Implemented in this review

- Upgraded vulnerable Next.js 14 to Next.js 16.2.10 and React 19.2.7.
- Migrated to flat ESLint, current route typing, Turbopack, self-hosted fonts, and bundled icons.
- Added CSP and browser security headers; removed the third-party runtime icon script.
- Replaced browser-readable bearer-token storage with short-lived HttpOnly access cookies and rotating refresh cookies.
- Added automatic session refresh, token-type separation, email normalization, stronger validation, hashed reset tokens, account deletion, origin checks, and production secret fail-closed behavior.
- Restricted ingestion/backfill operations to configured administrators.
- Added duplicate-save database protection and useful saved-paper metadata.
- Added authenticated `/api/search` compatibility, query limits, filter allowlisting, embedding validation, Qdrant timeouts, and source-abstract-first embeddings.
- Added request IDs, structured request logs, liveness/readiness endpoints, pinned direct Python dependencies, and a pinned Qdrant image.
- Removed unimplemented billing, trial, physician-review, institution, follow-alert, and “six/seven agent” claims from the UI.
- Added beta terms/privacy notices and accurate product disclaimers.
- Removed the pipeline’s committed credential, added environment configuration and model/prompt provenance, hardened XML parsing, enforced request rate limits, and stopped silently repairing truncated JSON.
- Hardened prompts against source prompt injection, forced clinical significance, causal overstatement, and informal GRADE claims.
- Added deterministic quote checks, recomputed verification scores, evidence-bearing verification context selection, output quarantine, and version-aware retry behavior.
- Added verification-coverage minimums, strict mind-map bounds, evidence-bearing long-paper truncation, atomic result writes, duplicate-source protection, failed-regeneration invalidation, provenance-gated database upserts, and production suppression of stale AI output.

## Verification evidence

- `npm run lint`: pass, zero warnings.
- `npm run typecheck`: pass.
- `npm run build`: pass on Next.js 16.2.10/Turbopack; 16 routes generated.
- Backend: 31 tests pass.
- AI pipeline: 11 safety tests pass.
- Production smoke: `/`, `/search`, `/pricing`, `/privacy`, `/terms`, `/login`, and `/register` return HTTP 200 with the expected security headers.
- Python direct dependencies: no known vulnerabilities reported by `pip-audit`.
- npm: no high or critical advisories. Two moderate entries remain because the latest Next.js package pins PostCSS 8.4.31 internally; npm proposes an invalid Next.js 9 downgrade rather than a safe fix. Application CSS is developer-controlled, but this upstream advisory should be monitored.

## Post-beta priorities

- Adopt a full migration tool such as Alembic rather than relying on `create_all` plus manual SQL.
- Move in-memory rate limiting to Redis or an API gateway for multi-instance deployments.
- Add browser end-to-end tests for registration, refresh, reset, save/unsave, deletion, search fallback, and mobile accessibility.
- Add field analytics only after consent/privacy decisions; do not silently introduce tracking during the closed beta.
- Add a model/provider change-control process, prompt evaluation dataset, rollback procedure, cost budgets, and per-version quality dashboard.
