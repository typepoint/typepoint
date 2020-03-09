import { createMiddleware } from '@typepoint/server';

export const responseTimeMiddleware = createMiddleware(async (context, next) => {
  const start = Date.now();
  try {
    await next();
  } finally {
    const duration = `${Date.now() - start}ms`;
    context.response.header('x-response-time', duration);
  }
}, 'responseTimeMiddleware');
