import 'reflect-metadata';
import * as getPort from 'get-port';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import { Container } from 'inversify';
// import chalk from 'chalk';

import { Router } from '../../src/server';
import { toMiddleware } from '../../src/server/express';

import { Constructor } from '../../src/shared';
import { ResponseTimeMiddleware } from './middleware';
import { GetTodoHandler, GetTodosHandler, CreateTodoHandler, UpdateTodoHandler, DeleteTodoHandler } from './handlers';
import { RequestLoggerMiddleware } from './middleware/requestLogger';

export class Server {
  public get serverAddress() {
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
      ]
    });
    const middleware = toMiddleware(router, {
      // log: (...args: any[]) => {
      //   const firstArg = `${ args[0] }`;
      //   const color = (firstArg.toLowerCase().indexOf('error') === 0) ? chalk.red : chalk.cyan;
      //   console.log(...args.map(arg => color(`${ arg }`)));
      // }
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
      };

      this.server.close(() => resolve());
    });
  }
}
