import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Reclutamiento y EvaluaciÃ³n Psicolaboral - AquaChile',
      version: '1.0.0',
      description: 'DocumentaciÃ³n REST API con autenticaciÃ³n JWT, gestiÃ³n de ofertas, postulaciones con CV y flujo de evaluaciÃ³n.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor Local de Desarrollo',
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
    },
  },
  apis: ['./server.js'], // leerÃ¡ los comentarios @swagger de server.js
};

const specs = swaggerJsdoc(options);

export const configurarSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
