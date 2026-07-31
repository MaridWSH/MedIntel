-- PostgreSQL migration: admin roles and analytics event tracking.

ALTER TABLE users
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    visitor_id VARCHAR(64),
    session_id VARCHAR(64),
    path VARCHAR(500),
    paper_id VARCHAR(50),
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_events_type_created
ON analytics_events (event_type, created_at);

CREATE INDEX idx_analytics_events_created
ON analytics_events (created_at);

CREATE INDEX idx_analytics_events_user
ON analytics_events (user_id);

CREATE INDEX idx_analytics_events_visitor
ON analytics_events (visitor_id);

CREATE INDEX idx_analytics_events_session
ON analytics_events (session_id);
