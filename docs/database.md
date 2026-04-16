# Database Schema Documentation

## Overview

The PeerDev backend uses MySQL 8.0 with a UUID-based security model. All primary keys use UUIDs (`VARCHAR(36)`) instead of auto-incrementing integers for enhanced security and privacy.

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | Role name |
| `description` | TEXT | NULL | Role description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

#### Indexes

- `PRIMARY KEY (id)` - Primary key index on UUID
- `UNIQUE KEY (name)` - Unique constraint on role name

#### Seeded Roles

Current seed data includes:

| Role | Description |
|------|-------------|
| `learner` | Basic platform user who can access educational content and connect with peers |
| `mentor` | An experienced individual who provides guidance and mentorship across various skills |

### `users` Table

Stores user account information with UUID-based identification.

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    username VARCHAR(50) UNIQUE,
    profile_picture VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),

    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),

    experience_level ENUM(
        'beginner','junior','mid_level','senior',
        'lead','manager','principal','architect'
    ) DEFAULT 'beginner',

    role_id VARCHAR(36) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    verification_token_expires TIMESTAMP NULL,
    refresh_token VARCHAR(255) NULL,

    FOREIGN KEY (role_id) REFERENCES roles(id),

    INDEX idx_users_email (email),
    INDEX idx_users_experience (experience_level)
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| `first_name` | VARCHAR(50) | NOT NULL | User first name |
| `last_name` | VARCHAR(50) | NOT NULL | User last name |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | User email address |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `username` | VARCHAR(50) | UNIQUE | Optional username |
| `profile_picture` | VARCHAR(255) | NULL | URL to profile picture |
| `bio` | TEXT | NULL | User bio |
| `location` | VARCHAR(100) | NULL | User location |
| `github_url` | VARCHAR(255) | NULL | GitHub profile URL |
| `linkedin_url` | VARCHAR(255) | NULL | LinkedIn profile URL |
| `portfolio_url` | VARCHAR(255) | NULL | Portfolio URL |
| `experience_level` | ENUM | DEFAULT 'beginner' | User's experience level |
| `role_id` | VARCHAR(36) | NOT NULL | References `roles.id` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether the user account is active |
| `last_login` | TIMESTAMP | NULL | Last login timestamp |
| `email_verified` | BOOLEAN | DEFAULT FALSE | Email verification status |
| `verification_token` | VARCHAR(255) | NULL | Email verification token |
| `verification_token_expires` | TIMESTAMP | NULL | Verification token expiry timestamp |
| `refresh_token` | VARCHAR(255) | NULL | Refresh token for authentication |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

#### Indexes

- `PRIMARY KEY (id)` - Primary key index on UUID
- `UNIQUE KEY (email)` - Unique constraint on email
- `INDEX idx_users_email (email)` - Performance index for email lookups
- `INDEX idx_users_experience (experience_level)` - Performance index for experience filtering
- `role_id` is eligible for an index due to the foreign key relationship with `roles.id`

#### Experience Levels

| Level | Description |
|-------|-------------|
| `beginner` | New to programming |
| `junior` | Basic programming skills |
| `mid_level` | Solid programming foundation |
| `senior` | Advanced skills and leadership |
| `lead` | Technical leadership role |
| `manager` | People and project management |
| `principal` | Senior technical architect |
| `architect` | System design and architecture expert |

### `skills` Table

Stores skill tags that users can attach to their profile and session requests.

```sql
CREATE TABLE skills (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Skill name |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

### `user_skills` Table

Maps users to skills for many-to-many skill relationships.

```sql
CREATE TABLE user_skills (
    user_id VARCHAR(36),
    skill_id VARCHAR(36),
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);
```

#### Relationship Details

- `user_skills.user_id → users.id`
- `user_skills.skill_id → skills.id`
- Cascading delete removes skill mappings when a user or skill is deleted

### `session_requests` Table

Tracks requests from learners to mentors for peer programming or mentorship sessions.

```sql
CREATE TABLE session_requests (
    id VARCHAR(36) PRIMARY KEY,
    requester_id VARCHAR(36) NOT NULL,
    mentor_id VARCHAR(36) NOT NULL,
    skill_id VARCHAR(36) NOT NULL,
    message TEXT,
    status ENUM('pending','accepted','rejected','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id),
    INDEX idx_requests_status (status),
    INDEX idx_requests_mentor (mentor_id)
);
```

### `sessions` Table

Stores confirmed session details.

```sql
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL UNIQUE,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
    meeting_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES session_requests(id) ON DELETE CASCADE
);
```

### `messages` Table

Contains messages exchanged between users in the context of a session.

```sql
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36),
    sender_id VARCHAR(36),
    receiver_id VARCHAR(36),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_session (session_id)
);
```

### `notifications` Table

Stores user notifications.

```sql
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    type VARCHAR(50),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
);
```

## Relationships

### Foreign Key Constraints

The database uses foreign key constraints to preserve referential integrity across users, roles, skills, session requests, sessions, messages, and notifications.

#### Relationship Details

- **users.role_id → roles.id**
  - Each user has one role
  - Deleting a role may affect user assignments
- **user_skills.user_id → users.id** and **user_skills.skill_id → skills.id**
  - Many-to-many mapping between users and skills
- **session_requests.requester_id → users.id** and **session_requests.mentor_id → users.id**
  - Requests link learners and mentors
- **sessions.request_id → session_requests.id**
  - Each session is tied to a single request
- **messages.session_id → sessions.id**
  - Messages are associated with a specific session
- **notifications.user_id → users.id**
  - Notifications belong to users

## Seed Data

### Seed Script

Seed data is loaded from `src/database/seeds/seed_roles.sql`.

```sql
INSERT INTO roles (id, name, description) VALUES
    (UUID(), 'learner', 'Basic platform user who can access educational content and connect with peers.'),
    (UUID(), 'mentor', 'An experienced individual who provides guidance and mentorship across various skills.');
```

### Current Seeded Roles

| Role | Description |
|------|-------------|
| `learner` | Basic platform user who can access educational content and connect with peers |
| `mentor` | An experienced individual who provides guidance and mentorship |

## Migration History

### Migration 001: Initial Tables

- Created `roles`, `users`, `skills`, `user_skills`, `session_requests`, `sessions`, `messages`, and `notifications`
- Established foreign key relationships and indexes
- Added user profile, verification, and activity fields

### Migration 002: Add Refresh Token

- Added `refresh_token` column to the `users` table for persistent authentication support

## Performance Considerations

### UUID vs Auto-Increment Performance

- **Storage**: UUIDs use 36 bytes vs 4 bytes for integers
- **Index Performance**: Slightly slower than integer indexes
- **Generation**: UUID generation is fast with modern libraries
- **Trade-off**: Security benefits outweigh minor performance costs

### Optimization Strategies

1. **Proper Indexing**: Index frequently queried columns such as email, status, and experience level
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
