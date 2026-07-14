-- SQLite migration for the two closed-beta feedback forms.

CREATE TABLE IF NOT EXISTS research_survey_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    professional_role VARCHAR(100) NOT NULL,
    specialty VARCHAR(150) NOT NULL DEFAULT '',
    years_experience VARCHAR(50) NOT NULL,
    sources TEXT NOT NULL,
    sources_other TEXT NOT NULL DEFAULT '',
    papers_needed VARCHAR(50) NOT NULL,
    most_time_consuming VARCHAR(100) NOT NULL,
    most_time_consuming_other TEXT NOT NULL DEFAULT '',
    biggest_problem VARCHAR(100) NOT NULL,
    biggest_problem_other TEXT NOT NULL DEFAULT '',
    trust_level VARCHAR(20) NOT NULL,
    trust_reason TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_research_survey_submissions_created_at
ON research_survey_submissions (created_at);

CREATE TABLE IF NOT EXISTS product_feedback_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    ease_of_use_rating INTEGER NOT NULL CHECK (ease_of_use_rating BETWEEN 1 AND 5),
    search_rating INTEGER NULL CHECK (search_rating BETWEEN 1 AND 5),
    summary_rating INTEGER NULL CHECK (summary_rating BETWEEN 1 AND 5),
    features_used TEXT NOT NULL,
    most_useful TEXT NOT NULL DEFAULT '',
    problems_encountered TEXT NOT NULL DEFAULT '',
    improvements TEXT NOT NULL DEFAULT '',
    feature_requests TEXT NOT NULL DEFAULT '',
    would_recommend VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_product_feedback_submissions_created_at
ON product_feedback_submissions (created_at);
