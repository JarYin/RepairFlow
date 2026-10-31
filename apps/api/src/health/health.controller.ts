import { Controller, Get } from '@nestjs/common';
import { type HealthResponse, healthResponseSchema } from '@repairflow/contracts';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({ status: 'ok' });
  }
}
