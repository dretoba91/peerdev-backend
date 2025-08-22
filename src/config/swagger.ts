import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PeerDev API',
      version: '1.0.0',
      description: 'A secure peer-to-peer development platform API with UUID-based security and role-based access control',
      contact: {
        name: 'PeerDev Team',
        email: 'support@peerdev.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.peerdev.com/v1',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint'
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { 
              type: 'string', 
              format: 'uuid', 
              example: 'cb26fcea-5356-4201-8ead-d98c66e1e543',
              description: 'Unique user identifier (UUID)'
            },
            full_name: { 
              type: 'string', 
              example: 'John Doe',
              description: 'User\'s full name'
            },
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'john.doe@example.com',
              description: 'User\'s email address'
            },
            role_id: { 
              type: 'string', 
              format: 'uuid', 
              example: 'aa933299-7d29-11f0-9050-b248b0b45048',
              description: 'Role identifier (UUID)'
            },
            experience_level: { 
              type: 'string', 
              enum: ['beginner', 'junior', 'mid_level', 'senior', 'lead', 'manager', 'principal', 'architect'],
              example: 'mid_level',
              description: 'User\'s experience level'
            },
            created_at: { 
              type: 'string', 
              format: 'date-time',
              example: '2025-08-19T17:47:56.000Z',
              description: 'Account creation timestamp'
            },
            updated_at: { 
              type: 'string', 
              format: 'date-time',
              example: '2025-08-19T17:47:56.000Z',
              description: 'Last update timestamp'
            }
          },
          required: ['full_name', 'email']
        },
        UserWithToken: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              type: 'object',
              properties: {
                access_token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'JWT access token for authentication'
                }
              },
              required: ['access_token']
            }
          ]
        },
        Role: {
          type: 'object',
          properties: {
            id: { 
              type: 'string', 
              format: 'uuid', 
              example: 'aa933299-7d29-11f0-9050-b248b0b45048',
              description: 'Unique role identifier (UUID)'
            },
            name: { 
              type: 'string', 
              example: 'developer',
              description: 'Role name'
            },
            description: { 
              type: 'string', 
              example: 'Basic platform user who can connect with other developers',
              description: 'Role description'
            },
            created_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Role creation timestamp'
            },
            updated_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Last update timestamp'
            }
          },
          required: ['name']
        },
        UserRegistration: {
          type: 'object',
          properties: {
            full_name: { 
              type: 'string', 
              example: 'John Doe',
              description: 'User\'s full name'
            },
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'john.doe@example.com',
              description: 'User\'s email address'
            },
            password: { 
              type: 'string', 
              minLength: 8,
              example: 'SecurePassword123!',
              description: 'User\'s password (minimum 8 characters)'
            },
            experience_level: { 
              type: 'string', 
              enum: ['beginner', 'junior', 'mid_level', 'senior', 'lead', 'manager', 'principal', 'architect'],
              example: 'mid_level',
              description: 'User\'s experience level'
            }
          },
          required: ['full_name', 'email', 'password']
        },
        UserLogin: {
          type: 'object',
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'john.doe@example.com',
              description: 'User\'s email address'
            },
            password: { 
              type: 'string', 
              example: 'SecurePassword123!',
              description: 'User\'s password'
            }
          },
          required: ['email', 'password']
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'User not found',
              description: 'Error message'
            }
          },
          required: ['error']
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };
