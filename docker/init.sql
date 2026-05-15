-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'recruiter', 'sourcer', 'viewer');
CREATE TYPE candidate_status AS ENUM ('new', 'contacted', 'interested', 'interviewing', 'offered', 'hired', 'rejected', 'archived');
CREATE TYPE conversation_role AS ENUM ('user', 'assistant', 'system', 'agent');
CREATE TYPE agent_status AS ENUM ('idle', 'running', 'completed', 'failed', 'paused');
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'completed', 'failed');
