import * as Joi from 'joi';

export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'test' | 'production';
  FRONTEND_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
}

const schema = Joi.object<EnvConfig>({
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  FRONTEND_URL: Joi.string().uri().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).default(3306),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  BREVO_API_KEY: Joi.string().allow('').default(''),
  BREVO_SENDER_EMAIL: Joi.string().email().required(),
}).unknown(true);

interface ValidationResult {
  error?: Joi.ValidationError;
  value: unknown;
}

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = schema.validate(config, {
    abortEarly: false,
    stripUnknown: false,
  }) as ValidationResult;

  if (result.error) {
    const messages = result.error.details
      .map((d) => `  - ${d.message}`)
      .join('\n');
    throw new Error(`Configuration invalide :\n${messages}`);
  }

  return result.value as EnvConfig;
}
