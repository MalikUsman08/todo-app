import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        console.log('Database URL:', dbUrl ? 'URL is set' : 'URL is not set');
        console.log('NODE_ENV:', configService.get<string>('NODE_ENV'));

        return {
          type: 'postgres' as const,
          url: dbUrl,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: true, // This will run migrations automatically
          synchronize: false, // Disable synchronize in production
          ssl:
            configService.get<string>('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
          logging: true,
          connectTimeoutMS: 10000, // 10 seconds
          extra: {
            connectionTimeoutMillis: 10000,
            query_timeout: 10000,
            statement_timeout: 10000,
          },
          retryAttempts: 10,
          retryDelay: 3000, // 3 seconds
          keepConnectionAlive: true,
        };
      },
      inject: [ConfigService],
    }),
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
