-- Run once to create the upvote deduplication table
CREATE TABLE IF NOT EXISTS issue_upvotes (
    id         BIGSERIAL PRIMARY KEY,
    issue_id   TEXT        NOT NULL,
    user_id    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_issue_user_upvote UNIQUE (issue_id, user_id)
);
