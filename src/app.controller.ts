import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async checkHealth() {
    try {
      // Test database connection
      await this.dataSource.query('SELECT 1');
      const dbUrl = this.configService.get<string>('DATABASE_URL');

      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        databaseInfo: {
          host: dbUrl ? new URL(dbUrl).hostname : 'unknown',
          port: dbUrl ? new URL(dbUrl).port : 'unknown',
          database: dbUrl ? new URL(dbUrl).pathname.substring(1) : 'unknown',
          ssl: this.configService.get<string>('DATABASE_SSL') === 'true',
        },
      };
    } catch (error: unknown) {
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        databaseInfo: {
          host: dbUrl ? new URL(dbUrl).hostname : 'unknown',
          port: dbUrl ? new URL(dbUrl).port : 'unknown',
          database: dbUrl ? new URL(dbUrl).pathname.substring(1) : 'unknown',
          ssl: this.configService.get<string>('DATABASE_SSL') === 'true',
        },
      };
    }
  }
}
