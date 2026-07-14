-- Apply once to an existing PostgreSQL deployment before the beta release.
-- New databases receive the same constraint from backend/models.py.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE papers
ADD COLUMN IF NOT EXISTS pipeline_version VARCHAR(50) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS source_sha256 VARCHAR(64) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS prompt_sha256 TEXT NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS generation_models TEXT NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS ix_papers_pipeline_version
ON papers (pipeline_version);

DELETE FROM saved_papers older
USING saved_papers newer
WHERE older.user_id = newer.user_id
  AND older.paper_id = newer.paper_id
  AND older.id > newer.id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_papers_user_paper
ON saved_papers (user_id, paper_id);
