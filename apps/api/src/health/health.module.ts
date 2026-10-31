import { Module } from '@nestjs/common';
import { cycleDemoMarker } from '../cycle-demo/cycle-demo.marker.js';
import { HealthController } from './health.controller.js';

export const marker = cycleDemoMarker;

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
