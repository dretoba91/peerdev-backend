# Database Schema Documentation

## Overview

The PeerDev backend uses MySQL 8.0 with a UUID-based security model. All primary keys use UUIDs (VARCHAR(36)) instead of auto-incrementing integers for enhanced security and privacy.

## Security Benefits of UUID Primary Keys

- **No ID Enumeration**: Prevents attackers from guessing valid IDs
- **Privacy Protection**: Hides user count and creation order
- **Distributed System Ready**: UUIDs are globally unique
- **Enhanced Security**: Non-sequential identifiers prevent data mining

## Database Tables

### `roles` Table

Stores user role definitions with associated permissions.

```sql
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_roles_name (name)
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | Role name (e.g., 'developer', 'admin') |
| `description` | TEXT | NULL | Role description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

#### Indexes

- `PRIMARY KEY (id)` - Primary key index on UUID
- `UNIQUE KEY (name)` - Unique constraint on role name
- `INDEX idx_roles_name (name)` - Performance index for name lookups

#### Default Roles

| Role | Description |
|------|-------------|
| `developer` | Basic platform user who can connect with other developers |
| `mentor` | Experienced developer who can guide and teach others |
| `moderator` | Community moderator who maintains platform standards |
| `event_organizer` | Organizes coding events and peer programming sessions |
| `content_creator` | Creates educational content and tutorials |
| `admin` | Platform administrator with user management capabilities |
| `super_admin` | Full system administrator with all permissions |

### `users` Table

Stores user account information with UUID-based identification.

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id VARCHAR(36),
    experience_level ENUM(
        'beginner', 
        'junior', 
        'mid_level', 
        'senior', 
        'lead', 
        'manager',
        'principal',
        'architect'
    ) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role_id (role_id),
    INDEX idx_users_experience_level (experience_level)
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| `full_name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | User's email address |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role_id` | VARCHAR(36) | FOREIGN KEY | References roles.id |
| `experience_level` | ENUM | DEFAULT 'beginner' | User's experience level |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

#### Indexes

- `PRIMARY KEY (id)` - Primary key index on UUID
- `UNIQUE KEY (email)` - Unique constraint on email
- `INDEX idx_users_email (email)` - Performance index for email lookups
- `INDEX idx_users_role_id (role_id)` - Performance index for role-based queries
- `INDEX idx_users_experience_level (experience_level)` - Performance index for experience filtering

#### Experience Levels

| Level | Description |
|-------|-------------|
| `beginner` | New to programming (0-1 years) |
| `junior` | Basic programming skills (1-2 years) |
| `mid_level` | Solid programming foundation (2-5 years) |
| `senior` | Advanced skills and leadership (5-8 years) |
| `lead` | Technical leadership role (8+ years) |
| `manager` | People and project management |
| `principal` | Senior technical architect |
| `architect` | System design and architecture expert |

## Relationships

### Foreign Key Constraints

```sql
-- Users belong to roles
ALTER TABLE users 
ADD CONSTRAINT fk_users_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;
```

#### Relationship Details

- **users.role_id → roles.id** (Many-to-One)
  - Each user can have one role
  - Multiple users can share the same role
  - If a role is deleted, user.role_id is set to NULL
  - Cascading delete is not used to preserve user accounts

## Data Examples

### Sample Role Data

```sql
INSERT INTO roles (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'developer', 'Basic platform user'),
('550e8400-e29b-41d4-a716-446655440001', 'mentor', 'Experienced developer'),
('550e8400-e29b-41d4-a716-446655440002', 'admin', 'Platform administrator');
```

### Sample User Data

```sql
INSERT INTO users (id, full_name, email, password, role_id, experience_level) VALUES
(
    'cb26fcea-5356-4201-8ead-d98c66e1e543',
    'John Doe',
    'john.doe@example.com',
    '$2b$10$hashedpasswordhere',
    '550e8400-e29b-41d4-a716-446655440000',
    'mid_level'
);
```

## Migration History

### Migration 001: Initial Tables

- Created `roles` table with UUID primary key
- Created `users` table with UUID primary key
- Established foreign key relationship
- Added performance indexes

## Performance Considerations

### UUID vs Auto-Increment Performance

- **Storage**: UUIDs use 36 bytes vs 4 bytes for integers
- **Index Performance**: Slightly slower than integer indexes
- **Generation**: UUID generation is fast with modern libraries
- **Trade-off**: Security benefits outweigh minor performance costs

### Optimization Strategies

1. **Proper Indexing**: All foreign keys and frequently queried columns are indexed
2. **Query Optimization**: Use UUID indexes for joins and lookups
3. **Connection Pooling**: Database connection pool configured for optimal performance
4. **Prepared Statements**: All queries use prepared statements for security and performance

## Security Measures

### Password Security

- Passwords are hashed using bcrypt with salt rounds
- Plain text passwords are never stored
- Password validation enforced at application level

### UUID Security

- UUIDs are generated using cryptographically secure random number generators
- No predictable patterns in ID generation
- Prevents enumeration attacks and data mining

### Data Integrity

- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate emails and role names
- NOT NULL constraints on critical fields

## Backup and Recovery

### Recommended Backup Strategy

1. **Daily Full Backups**: Complete database backup
2. **Transaction Log Backups**: Every 15 minutes
3. **Point-in-Time Recovery**: Enabled for disaster recovery

### Sample Backup Commands

```bash
# Full backup
mysqldump -h localhost -u backup_user -p peerdev_db > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -h localhost -u root -p peerdev_db < backup_20250819.sql
```

## Monitoring and Maintenance

### Performance Monitoring

- Monitor slow query log for optimization opportunities
- Track index usage and effectiveness
- Monitor connection pool utilization

### Regular Maintenance

- Analyze table statistics monthly
- Optimize tables quarterly
- Review and update indexes based on query patterns

---

**Note**: This schema is designed for scalability and security. The UUID-based approach provides enhanced security while maintaining good performance for typical application workloads.
