# PeerDev Backend — Technical Backlog & TODO

> Last updated: 2025
> This file tracks all deferred features, improvements, and technical debt across the PeerDev backend.
> Items are grouped by feature and tagged with priority: 🔴 High · 🟡 Medium · 🟢 Low

---

## ✅ Completed Features

- [x] Auth System — Register, OTP verification, Login, Logout, Refresh tokens
- [x] Multi-device session management
- [x] Middleware architecture — Auth, RBAC, Validation, Error handling, Rate limiting
- [x] Follows — Follow, Unfollow, Followers, Following, Mutual check
- [x] Skills — Skill discovery, User skills, Search with pagination
- [x] Session Requests — Create, Accept, Reject, Cancel with pagination
- [x] Sessions — Create, View, Update, Cancel, Complete with ownership checks
- [x] Pagination — Offset-based pagination across all list endpoints

---

## 🔴 High Priority

### Auth & Security
- [ ] **Email/SMS Service** — Replace `[DEV ONLY]` OTP console logs with a real email/SMS provider (e.g. SendGrid, Twilio, AWS SES)
- [ ] **Password Reset Flow** — Forgot password → OTP via email → reset password endpoint
- [ ] **Swagger Docs Cleanup** — Several endpoints still reference `full_name` instead of `first_name` + `last_name`. Follows, skills, session requests, and sessions endpoints are missing Swagger docs entirely

### Sessions
- [ ] **node-cron: Auto-expire sessions** — Cron job to mark sessions as `expired` when `scheduled_at` has passed and status is still `scheduled`
- [ ] **node-cron: Auto-complete sessions** — Cron job to mark sessions as `completed` when `scheduled_at + duration_minutes` has elapsed
- [ ] **Session reminder notifications** — Notify both users before their scheduled session time (e.g. 30 minutes before)

### Messages
- [ ] **Messages feature** — Design and implement the full messaging system between users (next feature to build)

---

## 🟡 Medium Priority

### Auth & Security
- [ ] **OAuth — Google Login** — Implement Google OAuth 2.0 using `passport-google-oauth20`
- [ ] **OAuth — GitHub Login** — Implement GitHub OAuth 2.0 using `passport-github2`
- [ ] **OAuth Mobile Deep Links** — Handle OAuth callback redirects back into the mobile app
- [ ] **Refresh token rotation on web** — Test and validate `sendRefreshTokenResponse` cookie rotation across web clients

### Notifications
- [ ] **In-app notifications** — Use existing `notifications` table to store and serve notifications
- [ ] **Email notifications** — Trigger emails for: session request sent, accepted, rejected, cancelled, session reminder
- [ ] **Push notifications** — Mobile push notifications for the mobile app
- [ ] **Session request notification** — Notify recipient when a new session request is received
- [ ] **Session accepted/rejected notification** — Notify requester when their request status changes

### Infrastructure
- [ ] **HTTPS setup** — SSL certificate via Nginx reverse proxy in production
- [ ] **Redis persistence** — Configure AOF or RDB persistence in Docker so OTPs and sessions survive container restarts
- [ ] **CSP expansion** — Update Helmet Content Security Policy when frontend is ready

### Anomaly Detection
- [ ] **Anomaly detection email** — Currently only logs `[ANOMALY]` warnings. Wire up to email service to notify users of new IP or device logins

---

## 🟢 Low Priority

### Skills
- [ ] **Skill categories/tags** — Group skills into categories (e.g. Programming, Design, Marketing, Communication)
- [ ] **Skill verification/endorsements** — Allow other users to endorse a peer's skills

### Sessions
- [ ] **Meeting link generation** — Auto-generate Google Meet links (currently just a plain string field)
- [ ] **Meeting platform options** — Allow users to choose between Google Meet, Zoom, Microsoft Teams, or a custom link
- [ ] **Webhook integration** — When a meeting platform API is available, receive real-time session events (join, leave, end)

### Content Feature
- [ ] **Written content** — Articles, tutorials, research posts (identified as future feature — needs schema design and implementation)

---

## 🧪 Testing (No tests written yet)

- [ ] **Unit tests** — Write unit tests for all service classes
- [ ] **Integration tests** — Write integration tests for all route handlers
- [ ] **Auth flow tests** — Register → OTP → Login → Refresh → Logout flow
- [ ] **Middleware tests** — RBAC, validation, and rate limiter middleware
- [ ] **Repository tests** — Database query tests with test DB

---

## 📝 Technical Debt

- [ ] **`validateNumericId` rename** — Method is misnamed, it validates UUIDs not numeric IDs. Rename to `validateUUIDParam` for clarity
- [ ] **Swagger examples** — Update all Swagger response examples to use `first_name` + `last_name` instead of `full_name`
- [ ] **`ErrorMiddleware` class** — Redundant class still exported from `shared/middleware/index.ts`. Remove entirely, `errorHandler` function is the single source of truth
- [ ] **Rate limiter `followsLimiter` key** — Verify `req.user?.id` is always available at the point the limiter runs (after authenticate middleware)
- [ ] **`updateSession` — status guard** — Consider preventing updates to sessions that are already `cancelled`, `completed`, or `expired`

---

## 🔮 Future Versions (v2+)

- [ ] **Admin dashboard** — Web interface for managing users, roles, sessions, and content
- [ ] **Real-time messaging** — WebSocket or Socket.io for live chat between users
- [ ] **Video sessions** — Build a custom meeting room inside PeerDev (long-term)
- [ ] **Cursor-based pagination** — Migrate from offset to cursor-based pagination when records exceed 1 million
- [ ] **Search & discovery** — Full-text search across users, skills, and content
- [ ] **Analytics** — Session completion rates, active users, skill demand trends

---

## 📋 How to Use This File

- When implementing a TODO item, move it to the `✅ Completed Features` section or delete it
- When discovering new technical debt, add it to the appropriate section
- Tag new items with the correct priority (🔴 🟡 🟢)
- Reference the relevant module/file in comments where helpful
