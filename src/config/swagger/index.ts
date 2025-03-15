const {
  SWAGGER_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  SWAGGER_TAGS,
  SWAGGER_API_PREFIX,
  SWAGGER_AUTH_TYPE,
  SWAGGER_AUTH_SCHEMA,
  SWAGGER_AUTH_NAME,
  SWAGGER_AUTH_DESCRIPTION,
  SWAGGER_AUTH_BEARER_FORMAT,
} = process.env;

export const swaggerConfig = {
  title: SWAGGER_TITLE || 'Custom Chatbot API',
  description:
    SWAGGER_DESCRIPTION || 'NestJS Chatbot API with pgvector API documentation',
  version: SWAGGER_VERSION || '1.0',
  tags: SWAGGER_TAGS || 'Custom chatbot API documentation',
  auth: {
    type: SWAGGER_AUTH_TYPE || 'http',
    schema: SWAGGER_AUTH_SCHEMA || 'bearer',
    name: SWAGGER_AUTH_NAME || 'Authorization',
    description: SWAGGER_AUTH_DESCRIPTION || 'JWT Token',
    bearer_format: SWAGGER_AUTH_BEARER_FORMAT || 'JWT',
  },
  apiPrefix: SWAGGER_API_PREFIX || 'api',
};
