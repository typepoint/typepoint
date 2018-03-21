import * as express from 'express';

import * as httpStatusCodes from 'http-status-codes';
import { EndpointContext, EndpointHandler, Request, Response, Router, UnprotectedRouter } from '../server';
import { cleanseHttpMethod } from '../shared/http';
import { StrongPointExpressRequest } from './express/strongPointExpressRequest';
import { StrongPointExpressResponse } from './express/strongPointExpressResponse';
import { HandlerMatchIterator } from './middlewareHelper';

interface ToMiddlewareOptions {
  log?: (...args: any[]) => void;
}

export function toMiddleware(router: Router, options?: ToMiddlewareOptions): express.RequestHandler {

  const log = (options && options.log) || console.log;

  const middleware: express.RequestHandler = async (
    req: express.Request, res: express.Response, next: express.NextFunction
  ) => {
    const allHandlers = router.getHandlers();

    const handlerMatchIterator = new HandlerMatchIterator(allHandlers, {
      method: cleanseHttpMethod(req.method),
      url: req.url
    });

    const request = new StrongPointExpressRequest(req);
    const response = new StrongPointExpressResponse(res);

    const context: EndpointContext<any, any, any> = {
      request,
      response
    };

    const executeNextHandler = async () => {
      const handlerMatch = handlerMatchIterator.getNextMatch();
      if (handlerMatch) {
        context.request.params = handlerMatch.parsedUrl.params;
        await handlerMatch.handler.handle(context, executeNextHandler);
      }
    };

    try {
      await executeNextHandler();
      if (!context.response.hasFlushedHeaders && !context.response.statusCode) {
        context.response.statusCode = httpStatusCodes.NOT_FOUND;
      }
      context.response.flush();
    } catch (err) {
      log('ERROR: ', err);
      if (context.response.hasFlushedHeaders) {
        context.response.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
        context.response.body = err && err.message;
        context.response.flush();
      }
    }
  };

  return middleware;
}
