import { healthResponseSchema } from './index.js';

describe('healthResponseSchema', () => {
  it('accepts a healthy response', () => {
    expect(healthResponseSchema.safeParse({ status: 'ok' }).success).toBe(true);
  });

  it.each([{}, { status: 'down' }, 'ok', null])('rejects %j', (body) => {
    expect(healthResponseSchema.safeParse(body).success).toBe(false);
  });
});
