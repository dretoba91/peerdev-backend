CREATE TABLE follows (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    follower_id VARCHAR(36) NOT NULL,
    following_id VARCHAR(36) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE KEY unique_follow (follower_id, following_id),

    INDEX idx_follows_follower (follower_id),
    INDEX idx_follows_following (following_id)
);