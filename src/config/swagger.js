const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClickCard API',
      version: '1.0.0',
      description: 'Complete backend API for ClickCard including Authentication, User Profiles, Share Links, and Analytics',
      contact: {
        name: 'ClickCard Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone_number: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            gender: { type: 'string' },
            profile_picture: { type: 'string', description: 'Cloudinary URL of the profile picture' },
            public_profile_enabled: { type: 'boolean' },
            is_email_verified: { type: 'boolean' },
            is_profile_complete: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/swaggerDocs.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
