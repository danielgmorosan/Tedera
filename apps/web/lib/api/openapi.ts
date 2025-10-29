// Minimal manually constructed OpenAPI spec (subset) since automated generation lib unavailable.
let cached: any;

export function getOpenApiSpec() {
  if (cached) return cached;
  cached = {
    openapi: "3.1.0",
    info: { title: "Integrated API", version: "0.1.0" },
    paths: {
      "/api/auth/signup": {
        post: {
          summary: "Signup",
          requestBody: { required: true },
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Login",
          requestBody: { required: true },
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/properties": {
        get: { summary: "List properties" },
        post: { summary: "Create property", security: [{ bearerAuth: [] }] },
      },
      "/api/properties/{id}": {
        get: {
          summary: "Get property",
          parameters: [{ name: "id", in: "path", required: true }],
        },
      },
      "/api/investments": {
        get: {
          summary: "List user investments",
          security: [{ bearerAuth: [] }],
        },
        post: { summary: "Create investment", security: [{ bearerAuth: [] }] },
      },
      "/api/distributions": {
        post: {
          summary: "Create distribution",
          security: [{ bearerAuth: [] }],
        },
      },
      "/api/distributions/property/{id}": {
        get: {
          summary: "List distributions for property",
          parameters: [{ name: "id", in: "path", required: true }],
        },
      },
      "/api/distributions/my-earnings": {
        get: { summary: "User earnings", security: [{ bearerAuth: [] }] },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  };
  return cached;
}
