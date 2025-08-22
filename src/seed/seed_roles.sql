

-- src/seed/seed_roles.sql

INSERT INTO roles (id, name, description) VALUES
    (UUID(), 'developer', 'Basic platform user who can connect with other developers'),
    (UUID(), 'mentor', 'Experienced developer who can guide and teach others'),
    (UUID(), 'moderator', 'Community moderator who maintains platform standards'),
    (UUID(), 'event_organizer', 'Organizes coding events and peer programming sessions'),
    (UUID(), 'content_creator', 'Creates educational content and tutorials'),
    (UUID(), 'admin', 'Platform administrator with user management capabilities'),
    (UUID(), 'super_admin', 'Full system administrator with all permissions');
