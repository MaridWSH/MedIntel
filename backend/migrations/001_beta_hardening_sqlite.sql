-- For an existing local SQLite database only. Run once.

ALTER TABLE users
ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE papers
ADD COLUMN pipeline_version VARCHAR(50) NOT NULL DEFAULT '';

ALTER TABLE papers
ADD COLUMN source_sha256 VARCHAR(64) NOT NULL DEFAULT '';

ALTER TABLE papers
ADD COLUMN prompt_sha256 TEXT NOT NULL DEFAULT '{}';

ALTER TABLE papers
ADD COLUMN generation_models TEXT NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS ix_papers_pipeline_version
ON papers (pipeline_version);

DELETE FROM saved_papers
WHERE id NOT IN (
  SELECT MIN(id)
  FROM saved_papers
  GROUP BY user_id, paper_id
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_papers_user_paper
ON saved_papers (user_id, paper_id);
