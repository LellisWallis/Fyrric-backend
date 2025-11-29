-- GameCore Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_guest BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW()
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    leaderboard_id VARCHAR(100) NOT NULL,
    reset_type VARCHAR(20) DEFAULT 'never', -- never, daily, weekly, monthly, seasonal
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(api_key_id, leaderboard_id)
);

-- Leaderboard Scores table
CREATE TABLE IF NOT EXISTS leaderboard_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
    player_id VARCHAR(255) NOT NULL,
    player_name VARCHAR(100),
    score BIGINT NOT NULL,
    metadata JSONB,
    submitted_at TIMESTAMP DEFAULT NOW(),
    season VARCHAR(50) DEFAULT 'default'
);

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_ranking 
ON leaderboard_scores(leaderboard_id, season, score DESC);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL,
    region VARCHAR(50),
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, ready, in_progress, completed
    max_players INTEGER DEFAULT 2,
    current_players INTEGER DEFAULT 0,
    server_info JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Match Players table
CREATE TABLE IF NOT EXISTS match_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id VARCHAR(255) NOT NULL,
    skill_rating INTEGER,
    joined_at TIMESTAMP DEFAULT NOW()
);

-- Cloud Saves table
CREATE TABLE IF NOT EXISTS cloud_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    player_id VARCHAR(255) NOT NULL,
    save_data JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(api_key_id, player_id)
);

-- Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    event_name VARCHAR(100) NOT NULL,
    player_id VARCHAR(255),
    properties JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_time 
ON analytics_events(api_key_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name 
ON analytics_events(api_key_id, event_name, created_at DESC);

-- Usage Statistics table (for billing/monitoring)
CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(100) NOT NULL,
    calls_count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(api_key_id, endpoint, date)
);
