import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admin Backend API",
      version: "1.0.0",
      description: "REST API for the e-commerce admin backend",
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
          },
        },
        Car: {
          type: "object",
          properties: {
            id: { type: "string" },
            makes: { type: "string" },
            type: { type: "string" },
            model: { type: "string" },
            year: { type: "string" },
            price: { type: "string" },
            location: { type: "string" },
            images: {
              type: "array",
              items: { type: "string" },
            },
            userId: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
