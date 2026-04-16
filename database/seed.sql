-- Sample data for testing

-- Insert test users
INSERT INTO users (email, password, full_name, organization, role) VALUES
('admin@example.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'example', 'admin'),
('dev@example.com', '$2a$10$YourHashedPasswordHere', 'Developer User', 'example', 'developer'),
('maint@example.com', '$2a$10$YourHashedPasswordHere', 'Maintainer User', 'example', 'maintainer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample packages
INSERT INTO packages (name, version, description, package_type, file_path, uploaded_by, organization, downloads) VALUES
('example@sample-api', '1.0.0', 'Sample API package for testing', 'nodejs', 'sample-api-1.0.0.tar.gz', 1, 'example', 5),
('example@python-lib', '2.1.0', 'Python utility library', 'python', 'python-lib-2.1.0.tar.gz', 1, 'example', 3),
('example@java-service', '1.5.0', 'Java microservice', 'java', 'java-service-1.5.0.jar', 2, 'example', 2)
ON CONFLICT (name, version) DO NOTHING;

-- Note: To use this with real passwords:
-- 1. Generate bcrypt hashes:
--    const bcrypt = require('bcryptjs');
--    bcrypt.hash('password', 10).then(hash => console.log(hash));
-- 2. Replace the hash values above with actual hashes

-- Example for development only (NEVER use in production):
-- Password: 'password' hashed = '$2a$10$5X8Ot2a5X3u5u5u5u5u5u'
