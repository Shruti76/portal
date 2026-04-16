-- Developer Portal Database Schema

-- Users table with role-based access control
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'developer' CHECK (role IN ('admin', 'maintainer', 'developer', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages table for version control
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('java', 'python', 'nodejs', 'dotnet', 'go')),
  file_path VARCHAR(512) NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization VARCHAR(255) NOT NULL,
  downloads INTEGER DEFAULT 0,
  dependencies JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, version)
);

-- Test runs table for unit test execution tracking
CREATE TABLE IF NOT EXISTS test_runs (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  executed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'passed', 'failed')),
  output TEXT,
  error_output TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_packages_organization ON packages(organization);
CREATE INDEX IF NOT EXISTS idx_packages_version ON packages(version);
CREATE INDEX IF NOT EXISTS idx_test_runs_package ON test_runs(package_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Code Projects table for code editor
CREATE TABLE IF NOT EXISTS code_projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  language VARCHAR(50) NOT NULL CHECK (language IN ('javascript', 'typescript', 'python', 'java', 'go', 'rust', 'csharp', 'sql')),
  description TEXT,
  code TEXT DEFAULT '',
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Code Versions/History table
CREATE TABLE IF NOT EXISTS code_versions (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL REFERENCES code_projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  message VARCHAR(500) NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Executions table for tracking GitHub Actions runs
CREATE TABLE IF NOT EXISTS workflow_executions (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL REFERENCES code_projects(id) ON DELETE CASCADE,
  workflow_file VARCHAR(255) NOT NULL,
  github_run_id BIGINT,
  status VARCHAR(50) DEFAULT 'triggered' CHECK (status IN ('triggered', 'running', 'completed', 'failed', 'cancelled')),
  triggered_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_code_projects_org ON code_projects(organization);
CREATE INDEX IF NOT EXISTS idx_code_projects_created_by ON code_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_code_versions_project ON code_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_project ON workflow_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_github_run ON workflow_executions(github_run_id);

-- Add AD username column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS ad_username VARCHAR(255);
