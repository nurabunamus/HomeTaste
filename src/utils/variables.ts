const SWAGGER_OPTIONS = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HomeTaste API documentation with Swagger',
      version: '0.1.0',
      description:
        'This is a API application made with Express and documented with Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'HomeTaste',
        url: '',
        email: process.env.GMAIL_EMAIL,
      },
    },
    servers: [
      {
        url: process.env.BASE_URL,
      },
    ],
    components: {
      securitySchemes: {
        authTokenCompleted: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
  },
  apis: ['./src/docs/**/*.yaml'],
};

export default SWAGGER_OPTIONS;
