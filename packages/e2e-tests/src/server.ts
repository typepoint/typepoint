import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import { notFoundMiddleware, Router } from '@typepoint/server';
import { toMiddleware } from '@typepoint/express';
import { getValidateAndTransformFunction } from '@typepoint/joiful';
import {
  addTodoHandler,
  deleteTodoHandler,
  getCompletedTodosHandler,
  getTodoHandler,
  getTodosHandler,
  updateTodoHandler,
} from './handlers';
import { responseTimeMiddleware } from './middleware/responseTimeMiddleware';
import { requestLoggerMiddleware } from './middleware/requestLoggerMiddleware';

export class Server {
  get serverAddress() {
    return `http://localhost:${this.port}`;
  }

  private server: http.Server | undefined;

  // eslint-disable-next-line no-empty-function
  constructor(private port: number) {
  }

  async start() {
    if (this.server) {
      return;
    }

    const validateAndTransform = getValidateAndTransformFunction();

    const router = new Router({
      handlers: [
        getCompletedTodosHandler,
        getTodoHandler,
        getTodosHandler,
        addTodoHandler,
        updateTodoHandler,
        deleteTodoHandler,
      ],
      middleware: [
        requestLoggerMiddleware,
        responseTimeMiddleware,
        notFoundMiddleware(),
      ],
      validateAndTransform,
    });

    const middleware = toMiddleware(router);

    const app = express();
    app.use(bodyParser.json());
    app.use(middleware);

    const server = http.createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(this.port, () => resolve());
      this.server = server;
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => resolve());
    });
  }
}
