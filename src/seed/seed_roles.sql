

-- src/seed/seed_roles.sql

INSERT INTO roles (name, description) VALUES 
    ('developer', 'Basic platform user who can connect with other developers'),
    ('mentor', 'Experienced developer who can guide and teach others'),
    ('moderator', 'Community moderator who maintains platform standards'),
    ('event_organizer', 'Organizes coding events and peer programming sessions'),
    ('content_creator', 'Creates educational content and tutorials'),
    ('admin', 'Platform administrator with user management capabilities'),
    ('super_admin', 'Full system administrator with all permissions');
