import { buildOpenApiDocument } from './openapi.js';

describe('buildOpenApiDocument', () => {
  it('documents GET /api/health with the shape of the health contract', () => {
    const document = buildOpenApiDocument();

    expect(document.openapi).toMatch(/^3\./);
    expect(document.paths?.['/api/health']?.get?.responses?.['200']).toMatchObject({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: { status: { const: 'ok' } },
            required: ['status'],
          },
        },
      },
    });
  });
});
