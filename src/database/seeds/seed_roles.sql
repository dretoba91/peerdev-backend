

-- src/seed/seed_roles.sql

INSERT INTO roles (id, name, description) VALUES
    (UUID(), 'learner', 'Basic platform user who can access educational content and connect with peers.'),
    (UUID(), 'mentor', 'An experienced individual who provides guidance and mentorship across various skills.');