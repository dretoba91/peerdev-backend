# PeerDev Backend API

A secure peer-to-peer development platform backend built with Node.js, TypeScript, and MySQL, featuring UUID-based security and role-based access control.

## 🚀 Features

- **🔐 UUID-based Security**: All entities use UUIDs instead of auto-incrementing IDs for enhanced security
- **🔑 JWT Authentication**: Secure token-based authentication system
- **👥 Role-based Access Control (RBAC)**: Granular permission system with multiple user roles
- **📚 RESTful API**: Clean and intuitive API design following REST principles
- **🛡️ TypeScript**: Full type safety throughout the application
- **📖 API Documentation**: Interactive Swagger/OpenAPI documentation
- **🗄️ Database Migrations**: Structured database schema management
- **🔒 Password Security**: Bcrypt password hashing with salt rounds
- **⚡ Performance**: Optimized database queries with proper indexing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MySQL** 8.0 or higher
- **npm** or **yarn** package manager
- **Docker** (optional, for containerized database)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd peerdev-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=devuser
DB_PASSWORD=your_password
DB_NAME=peerdev_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=4h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Start the database

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Local MySQL**
- Install MySQL 8.0
- Create a database named `peerdev_db`
- Update connection details in `.env`

### 5. Run database migrations and seed data
```bash
# Run migrations to create tables
npm run migrate

# Seed initial roles
npm run seed:roles
```

### 6. Start the development server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Interactive Documentation
Visit `http://localhost:5000/api-docs` for interactive Swagger UI documentation.

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Quick Start Examples

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "experience_level": "mid_level"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

**Get user by UUID:**
```bash
curl -X GET http://localhost:5000/api/v1/users/{user-uuid} \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
│   ├── db.ts        # Database connection
│   ├── environment.ts # Environment variables
│   └── swagger.ts   # API documentation config
├── controllers/     # Route controllers
│   ├── auth.controller.ts
│   └── user.controller.ts
├── middleware/      # Custom middleware
│   ├── auth.middleware.ts
│   ├── rbac.middleware.ts
│   ├── validation.middleware.ts
│   └── errorHandler.ts
├── models/          # Database models
│   ├── user.model.ts
│   └── role.model.ts
├── routes/          # API routes
│   ├── auth.routes.ts
│   └── user.routes.ts
├── services/        # Business logic
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── role.service.ts
├── migrations/      # Database migrations
│   └── 001_create_tables.sql
├── seed/           # Database seed files
│   └── seed_roles.sql
├── scripts/        # Utility scripts
│   ├── run-migrations.ts
│   └── seed-roles.ts
└── utils/          # Utility functions
    └── loggers.ts
```

## 🔐 Security Features

### UUID-based Identification
- All primary keys use UUIDs instead of auto-incrementing integers
- Prevents ID enumeration attacks
- Enhances user privacy by hiding creation order and count

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control (RBAC) with multiple permission levels
- Password hashing using bcrypt with salt rounds

### Available Roles
- **developer**: Basic platform user
- **mentor**: Experienced developer who can guide others
- **moderator**: Community moderator
- **event_organizer**: Organizes coding events
- **content_creator**: Creates educational content
- **admin**: Platform administrator
- **super_admin**: Full system administrator

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm start           # Start production server

# Database
npm run migrate     # Run database migrations
npm run seed:roles  # Seed initial roles

# Testing
npm run test-db     # Test database connection

# Build
npm run build       # Compile TypeScript to JavaScript
```

## 🌐 Environment Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | Database host | `127.0.0.1` | Yes |
| `DB_PORT` | Database port | `3307` | Yes |
| `DB_USER` | Database username | `devuser` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | `peerdev_db` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | `4h` | No |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | Yes |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | `7d` | No |
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Health Checks
- `GET /` - Basic health check
- Database connection is verified on startup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](http://localhost:5000/api-docs)
2. Review the project structure and examples above
3. Open an issue on GitHub

---

**Built with ❤️ using Node.js, TypeScript, and MySQL**
