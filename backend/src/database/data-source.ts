import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';

loadEnv({ path: join(__dirname, '..', '..', '.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'invoiceflow_user',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'invoiceflow',
  charset: 'utf8mb4_unicode_ci',
  entities: [join(__dirname, 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging:
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
