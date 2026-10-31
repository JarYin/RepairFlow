import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports the API as healthy', () => {
    expect(new HealthController().getHealth()).toEqual({ status: 'ok' });
  });
});
