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
        Vehicle: {
          type: "object",
          properties: {
            id: { type: "string" },
            make: { type: "string" },
            type: { type: "string" },
            model: { type: "string" },
            year: { type: "integer" },
            lot: { type: "integer" },
            price: { type: "number" },
            location: { type: "string" },
            images: {
              type: "array",
              items: { type: "string" },
            },
            status: { type: "string", enum: ["active", "inactive", "sold"], default: "active" },
            isFeatured: { type: "boolean", default: false },
            priority: { type: "integer", default: 0 },
            views: { type: "integer", default: 0 },
            mileage: { type: "integer", default: 0 },
            engine: { type: "integer", default: 0 },
            transmission: {
              type: "string",
              enum: ["AUTOMATIC", "MANUAL", "SEMI_AUTOMATIC", "CVT"],
              default: "AUTOMATIC",
            },
            condition: {
              type: "string",
              enum: ["NEW", "USED"],
              default: "USED",
            },
            fuelType: {
              type: "string",
              enum: ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "PLUG_IN_HYBRID", "LPG", "CNG", "HYDROGEN"],
              default: "GASOLINE",
            },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        HeroVehicle: {
          type: "object",
          properties: {
            id: { type: "string" },
            tagLine: { type: "string" },
            subtitle: { type: "string" },
            image: { type: "string", description: "Cloudinary image URL" },
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
