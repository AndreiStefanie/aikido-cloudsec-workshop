CREATE TABLE
  challenges (
    id UUID PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    NAME TEXT NOT NULL,
    description TEXT NOT NULL,
    join_code TEXT NOT NULL,
    join_password TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

CREATE TABLE
  scenarios (
    id UUID PRIMARY KEY,
    challenge_id UUID NOT NULL REFERENCES challenges (id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    severity_label TEXT NOT NULL,
    remediation TEXT NOT NULL,
    resources JSONB NOT NULL,
    security_lesson TEXT,
    answer JSONB NOT NULL,
    alternatives JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

CREATE TABLE
  participant_sessions (
    id UUID PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    participant_name TEXT NOT NULL,
    challenge_id UUID NOT NULL REFERENCES challenges (id) ON DELETE CASCADE,
    current_scenario_index INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    correct_actions INTEGER NOT NULL DEFAULT 0,
    correct_owners INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

CREATE TABLE
  scenario_decisions (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES participant_sessions (id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL REFERENCES scenarios (id) ON DELETE CASCADE,
    submitted_action TEXT NOT NULL,
    submitted_owner_team TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, scenario_id)
  );

CREATE INDEX idx_scenarios_challenge_order ON scenarios (challenge_id, sort_order);

CREATE INDEX idx_sessions_challenge_completed ON participant_sessions (challenge_id, completed_at);
