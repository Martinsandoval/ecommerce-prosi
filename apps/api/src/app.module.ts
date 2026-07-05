import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import cacheConfig, { CacheConfig } from './config/cache.config';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PrismaModule } from './common/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, cacheConfig],
      validationSchema: envValidationSchema,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const { ttlMs } = configService.getOrThrow<CacheConfig>('cache');
        return { ttl: ttlMs };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
