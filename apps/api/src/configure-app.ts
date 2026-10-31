import type { INestApplication } from '@nestjs/common';

/** HTTP setup shared by every way of starting the API, so tests see what production serves. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
}
