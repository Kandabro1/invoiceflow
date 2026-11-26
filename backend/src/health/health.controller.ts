import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthResponseDto } from './dto/health-response.dto';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async check(): Promise<HealthResponseDto> {
    try {
      // Test simple : on demande à MySQL de faire 1+1
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Si MySQL est éteint, on renvoie une 503
      return {
        status: 'error',
        database: 'down',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
