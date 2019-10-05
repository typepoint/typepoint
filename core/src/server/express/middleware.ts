import * as express from 'express';

export function combineMiddlewares(middlewares: express.Handler[]): express.Handler {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let middlewareIndex = 0;

    function executeNextMiddleware() {
      if (middlewareIndex >= middlewares.length) {
        next();
        return;
      }

      const middleware = middlewares[middlewareIndex++];
      middleware(req, res, executeNextMiddleware);
    }

    executeNextMiddleware();
  };
}
