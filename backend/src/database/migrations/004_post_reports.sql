CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(post_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reports_unresolved ON post_reports(created_at DESC) WHERE resolved = FALSE;
