import { Pool } from 'pg';

import { env } from '../config/env.js';
import { InMemoryRepository } from '../modules/sessions/inMemoryRepository.js';
import { PostgresRepository } from '../modules/sessions/postgresRepository.js';
import type { Repository } from '../modules/sessions/types.js';

export function createRepository(): Repository {
  if (!env.DATABASE_URL) {
    return new InMemoryRepository();
  }

  const pool = new Pool({ connectionString: env.DATABASE_URL });
  return new PostgresRepository(pool);
}
