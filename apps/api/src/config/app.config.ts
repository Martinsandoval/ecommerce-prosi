import { registerAs } from '@nestjs/config';

export interface AppConfig {
  env: string;
  port: number;
}

export default registerAs('app', (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
}));
