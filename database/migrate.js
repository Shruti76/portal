const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const createDatabase = `
  CREATE DATABASE IF NOT EXISTS developer_portal;
`;

const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'developer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  package_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  organization VARCHAR(255) NOT NULL,
  downloads INTEGER DEFAULT 0,
  dependencies JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, version)
);

-- Test runs table
CREATE TABLE IF NOT EXISTS test_runs (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES packages(id),
  executed_by INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'running',
  output TEXT,
  error_output TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_packages_organization ON packages(organization);
CREATE INDEX IF NOT EXISTS idx_test_runs_package ON test_runs(package_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization);

-- Add dependencies column if it doesn't exist (for existing databases)
ALTER TABLE packages ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ad_username VARCHAR(255);
`;

async function migrate() {
  try {
    console.log('Starting database migration...');

    const client = await pool.connect();

    try {
      console.log('Creating tables...');
      await client.query(createTablesSQL);
      console.log('Database migration completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate().then(() => {
  pool.end();
  console.log('Pool closed');
});
