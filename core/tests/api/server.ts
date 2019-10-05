import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import { Container } from 'inversify';
import { NotFoundMiddleware, Router } from '../../src/server';
import { toMiddleware } from '../../src/server/express';
import { validateAndTransform } from '../../src/server/validation/tsdv-joi';
import { Constructor } from '../../src/shared';
import {
  CreateTodoHandler, DeleteTodoHandler, GetCompletedTodosHandler,
  GetTodoHandler, GetTodosHandler, UpdateTodoHandler
} from './handlers';
import { ResponseTimeMiddleware } from './middleware';
import { RequestLoggerMiddleware } from './middleware/requestLogger';

export class Server {
  get serverAddress() {
    return `http://localhost:${ this.port }`;
  }

  private server: http.Server | undefined;

  constructor(private port: number, private ioc: Container) {
  }

  async start() {
    if (this.server) {
      return;
    }

    const router = new Router({
      handlers: [
        GetCompletedTodosHandler,
        GetTodoHandler,
        GetTodosHandler,
        CreateTodoHandler,
        UpdateTodoHandler,
        DeleteTodoHandler
      ],
      ioc: {
        get: <T>(Class: Constructor<T>) => this.ioc.get(Class)
      },
      middleware: [
        RequestLoggerMiddleware,
        ResponseTimeMiddleware,
        NotFoundMiddleware
      ],
      validateAndTransform
    });

    // tslint:disable-next-line: no-console
    // const log = console.log.bind(console);

    const middleware = toMiddleware(router, {
      // logger: { log, info: log, warn: log, error: log, debug: log }
    });

    const app = express();
    app.use(bodyParser.json());
    app.use(middleware);

    const server = http.createServer(app);

    await new Promise(resolve => {
      server.listen(this.port, () => resolve());
      this.server = server;
    });
  }

  stop(): Promise<void> {
    return new Promise(resolve => {
      if (!this.server) {
        return resolve();
      }

      this.server.close(() => resolve());
    });
  }
}
