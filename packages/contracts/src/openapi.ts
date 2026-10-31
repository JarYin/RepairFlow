import { createDocument } from 'zod-openapi';
import { healthResponseSchema } from './health.js';

export function buildOpenApiDocument(): ReturnType<typeof createDocument> {
  return createDocument({
    openapi: '3.1.0',
    info: { title: 'RepairFlow API', version: '0.0.1' },
    paths: {
      '/api/health': {
        get: {
          summary: 'Report that the API is up, without touching the database',
          responses: {
            '200': {
              description: 'The API is up',
              content: { 'application/json': { schema: healthResponseSchema } },
            },
          },
        },
      },
    },
  });
}
