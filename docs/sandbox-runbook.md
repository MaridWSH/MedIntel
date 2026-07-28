# med.90days.online — sandbox runbook

The public demo of CiteRounds. It runs on the same box as production but shares
nothing with it except the reverse proxy and the standalone semantic-search
service.

> The design spec and plan under `docs/superpowers/` describe an earlier,
> inaccurate picture (Postgres, BGE-M3, Caddy). They are superseded by this
> file. What is written here is what is actually deployed.

## How a change reaches the demo

```
merge to MaridWSH/MedIntel main
        │  .github/workflows/mirror-to-sandbox.yml
        ▼
MaridWSH/medintel-sandbox main          (deploy mirror, force-pushed)
        │  .github/workflows/deploy-sandbox.yml
        ▼
self-hosted runner on this server       (user: runner-sandbox)
        │  rebuilds /opt/medintel-sandbox
        ▼
https://med.90days.online
```

`MedIntel` is authoritative. Do not land work directly on `medintel-sandbox`
main — the next merge to `MedIntel` force-pushes over it.

Both workflow files exist in both repos and are guarded on `github.repository`,
so each only runs where it belongs.

## What runs where

Production (`citerounds.com`) runs as **host systemd services**, not containers:

| | production | sandbox |
|---|---|---|
| frontend | `medintel-frontend.service`, `172.19.0.1:3000` | container, `172.19.0.1:3001` |
| backend | `medintel-backend.service`, `172.19.0.1:8001` | container, `172.19.0.1:8011` |
| database | SQLite `/root/MedIntel/medintel.db` | SQLite on volume `medintel-sandbox_medintel_sandbox_db` |
| vectors | Qdrant `papers_v1`, `127.0.0.1:6333` | Qdrant `papers_sandbox`, `127.0.0.1:6344` |
| embeddings | `all-MiniLM-L6-v2`, 384-dim | identical |

Both use `sentence-transformers/all-MiniLM-L6-v2` at **384 dimensions**.
Changing the model requires changing `MEDINTEL_EMBEDDING_DIMENSION` *and*
re-indexing into a fresh collection, or Qdrant rejects every query.

The frontend and backend publish on `172.19.0.1` — the kwamelrent docker bridge
gateway — rather than loopback, because the nginx container that terminates TLS
lives on that network and cannot reach the host's `127.0.0.1`.

## TLS and routing

Ports 80 and 443 belong to the **`kwamelrent_nginx` container**, not to this
project. The vhost lives at the end of `/root/KwamelRent/nginx/nginx.conf`
(mounted read-only as `/etc/nginx/conf.d/default.conf`).

Cloudflare fronts `med.90days.online` in **Full** (not Full Strict) mode, so the
origin certificate is self-signed and long-dated — `/root/KwamelRent/nginx/ssl/
med.90days.online.{crt,key}`. There is no Let's Encrypt renewal to worry about;
if Cloudflare is ever switched to Full Strict, replace it with a Cloudflare
Origin CA certificate.

After editing the vhost:

```bash
docker exec kwamelrent_nginx nginx -t && docker exec kwamelrent_nginx nginx -s reload
```

`nginx -t` first — a bad reload takes citerounds.com and kwamelrent.com down
with it.

## Build ordering

The Next.js prerender pass fetches from the API, so **the backend must be live
before the frontend image is built**. `getApiBase()` prefers
`MEDINTEL_INTERNAL_API_BASE` when running server-side, which lets the build talk
to the backend directly instead of looping out through Cloudflare — otherwise a
cold deploy deadlocks, because the backend cannot be reachable before the image
that fronts it exists.

The deploy workflow encodes this order: qdrant + backend, wait for health, then
frontend.

## Manual operations

**Run git in `/opt/medintel-sandbox` as `runner-sandbox`, never as root.** Root
leaves root-owned objects in `.git/objects`, and the next CI deploy dies with
`insufficient permission for adding an object to repository database`. If that
happens: `chown -R runner-sandbox:runner-sandbox /opt/medintel-sandbox`.

```bash
cd /opt/medintel-sandbox

# Deploy by hand (what the workflow does) — prefix git with
# `sudo -u runner-sandbox`

git fetch origin main && git reset --hard origin/main
cp .env.sandbox .env
docker compose -f docker-compose.sandbox.yml up -d --build qdrant backend
curl -fsS http://172.19.0.1:8011/api/health
docker compose -f docker-compose.sandbox.yml up -d --build frontend

# Logs
docker compose -f docker-compose.sandbox.yml logs -f backend

# Runner
systemctl status actions.runner.MaridWSH-medintel-sandbox.medintel-sandbox-runner
```

Secrets live only in `/opt/medintel-sandbox/.env.sandbox` (mode 600, owned by
`runner-sandbox`), copied to `.env` at deploy time. `.env.sandbox.template` in
the repo documents the shape. Nothing secret is committed.

## Re-seeding from production

The demo carries a full copy of production data. To refresh it:

```bash
# SQLite — .backup, not cp: production is live and cp yields a torn file.
python3 -c "
import sqlite3
s=sqlite3.connect('file:/root/MedIntel/medintel.db?mode=ro',uri=True)
d=sqlite3.connect('/tmp/seed.db'); s.backup(d); d.close(); s.close()"
docker run --rm -v medintel-sandbox_medintel_sandbox_db:/data -v /tmp:/seed alpine \
  cp /seed/seed.db /data/medintel.db

# Qdrant
NAME=$(curl -s -X POST http://127.0.0.1:6333/collections/papers_v1/snapshots \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['result']['name'])")
curl -s -o /tmp/papers.snapshot \
  "http://127.0.0.1:6333/collections/papers_v1/snapshots/$NAME"
curl -s -X POST \
  "http://127.0.0.1:6344/collections/papers_sandbox/snapshots/upload?priority=snapshot" \
  -F "snapshot=@/tmp/papers.snapshot"
curl -s -X DELETE "http://127.0.0.1:6333/collections/papers_v1/snapshots/$NAME"

docker compose -f docker-compose.sandbox.yml restart backend
```

The demo therefore contains **real user accounts and password hashes** copied
from production. Treat it as production-sensitive, not as throwaway data.

The sentence-transformers model is baked into the `hf_sandbox_cache` volume and
the backend runs with `HF_HUB_OFFLINE=1`, so a HuggingFace outage cannot break
search. Re-seed that volume from `/root/.cache/huggingface` if the model changes.
