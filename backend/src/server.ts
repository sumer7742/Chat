import { createServer } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectMongo, disconnectMongo } from './config/db';
import { disconnectRedis } from './config/redis';
import { initSocket } from './socket';

async function bootstrap(): Promise<void> {
  await connectMongo();

  const app = createApp();
  const httpServer = createServer(app);
  initSocket(httpServer);

  // Managed hosts (Render/Heroku/Railway) inject the port via PORT.
  const port = process.env.PORT ? Number(process.env.PORT) : env.API_PORT;
  httpServer.listen(port, env.API_HOST, () => {
    logger.info(`🚀 API listening on http://${env.API_HOST}:${port} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    httpServer.close();
    await Promise.allSettled([disconnectMongo(), disconnectRedis()]);
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled rejection'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
