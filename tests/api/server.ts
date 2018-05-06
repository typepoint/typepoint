import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as getPort from 'get-port';
import * as http from 'http';
import { Container } from 'inversify';
import 'reflect-metadata';

import { NotFoundMiddleware, Router } from '../../src/server';
import { toMiddleware } from '../../src/server/express';

import { Constructor } from '../../src/shared';
import { CreateTodoHandler, DeleteTodoHandler, GetTodoHandler, GetTodosHandler, UpdateTodoHandler } from './handlers';
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
      ]
    });
    const middleware = toMiddleware(router, {
      // log: (...args: any[]) => console.log(...args);
    });

    const app = express();
    app.use(bodyParser.json());
    app.use(middleware);

    const server = http.createServer(app);

    await new Promise((resolve, reject) => {
      server.listen(this.port, (err: any) => err ? reject(err) : resolve());
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
