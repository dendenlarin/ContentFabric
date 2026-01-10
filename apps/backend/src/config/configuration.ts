/**
 * Централизованная конфигурация приложения
 * Все переменные окружения загружаются и типизируются здесь
 */
export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/content_fabric',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
});

/**
 * Интерфейс конфигурации для типизации ConfigService
 */
export interface AppConfig {
  port: number;
  database: {
    uri: string;
  };
  redis: {
    host: string;
    port: number;
  };
  cors: {
    origin: string;
  };
}
