import { createMiddleware } from '@typepoint/server';
import { info } from '../services/loggerService';

export const requestLoggerMiddleware = createMiddleware(async ({ request, response }, next) => {
  let error: any;
  try {
    await next();
  } catch (err) {
    error = err;
  } finally {
    const responseTime = response.header('x-response-time');
    const errorMessage = error ? ` - ${error.message || error}` : '';
    info(
      `${request.method} ${request.url} - ${responseTime}${errorMessage}`,
    );
  }
});
