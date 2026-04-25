const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClickCard Authentication API',
      version: '1.0.0',
      description: 'Complete authentication backend with user registration, login, password management, and profile setup',
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
            is_email_verified: { type: 'boolean' },
            is_profile_complete: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/userRoutes.js', './src/swaggerDocs.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
