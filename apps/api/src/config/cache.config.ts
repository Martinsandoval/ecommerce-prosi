import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  ttlMs: number;
}

export default registerAs('cache', (): CacheConfig => ({
  ttlMs: parseInt(process.env.CACHE_TTL_MS ?? '30000', 10),
}));
