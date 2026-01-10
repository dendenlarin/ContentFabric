import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

/**
 * Класс для валидации переменных окружения
 * Все переменные опциональны, имеют значения по умолчанию в configuration.ts
 */
class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  MONGODB_URI?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;
}

/**
 * Функция валидации переменных окружения
 * Вызывается при инициализации ConfigModule
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}
