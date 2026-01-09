import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const PORT = parseInt(process.env.PORT || '3002', 10);

// Подключение к очередям
const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

// Регистрация очередей для мониторинга
const generationQueue = new Queue('generation', { connection });

// Настройка Bull-board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');

createBullBoard({
  queues: [new BullMQAdapter(generationQueue)],
  serverAdapter,
});

// Express сервер
const app = express();

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'admin-dashboard' });
});

// Bull-board UI
app.use('/', serverAdapter.getRouter());

app.listen(PORT, () => {
  console.log(`Admin dashboard running on http://localhost:${PORT}`);
  console.log(`Redis connection: ${REDIS_HOST}:${REDIS_PORT}`);
});
