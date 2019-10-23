import 'reflect-metadata';

import axios from 'axios';
import * as clone from 'clone';
import * as getPort from 'get-port';
import * as httpStatusCodes from 'http-status-codes';
import { Container, decorate, injectable } from 'inversify';
import { TypePointClient } from '@typepoint/client';
import { EndpointHandler, EndpointMiddleware, NotFoundMiddleware } from '@typepoint/server';
import { partialOf } from 'jest-helpers';
import { DataStore } from './db/dataStore';
import {
  createTodo, deleteTodo, getCompletedTodos, getTodo, getTodos, updateTodo,
} from './definitions';
import { Todo } from './models/todo';
import { Server } from './server';
import { LoggerService } from './services/loggerService';

describe('api/Sample Server', () => {
  let todos: Todo[];
  let ioc: Container;
  let server: Server;
  let client: TypePointClient;
  let loggerService: LoggerService;

  beforeAll(() => {
    decorate(injectable(), EndpointHandler);
    decorate(injectable(), EndpointMiddleware);
    decorate(injectable(), NotFoundMiddleware);
  });

  beforeEach(async () => {
    // Configure ioc
    todos = [
      {
        id: '1',
        title: 'Laundry',
        isCompleted: false,
      },
      {
        id: '2',
        title: 'Washing up',
        isCompleted: false,
      },
      {
        id: '3',
        title: 'Walk the cats',
        isCompleted: false,
      },
    ];
    ioc = new Container({
      defaultScope: 'Singleton',
      autoBindInjectable: true,
    });

    loggerService = partialOf<LoggerService>({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    });

    ioc.bind(DataStore).toDynamicValue(() => new DataStore(todos));
    ioc.bind(LoggerService).toDynamicValue(() => loggerService);

    const port = await getPort();

    server = new Server(port, ioc);
    await server.start();

    client = new TypePointClient({
      server: server.serverAddress,
    });
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should get list of todos', async () => {
    const expectation = clone(todos);

    const response = await client.fetch(getTodos);

    expect(response).toHaveProperty('statusCode', 200);

    expect(response).toHaveProperty('statusText', 'OK');

    expect(response).toHaveProperty('body', expectation);
  });

  it('should get list of completed todos', async () => {
    const expectation = clone(todos).filter((todo) => todo.isCompleted);
    const response = await client.fetch(getCompletedTodos);

    expect(response).toHaveProperty('statusCode', 200);

    expect(response).toHaveProperty('statusText', 'OK');

    expect(response).toHaveProperty('body', expectation);
  });

  it('should get a todo', async () => {
    const expectation = {
      id: '1',
      title: 'Laundry',
      isCompleted: false,
    };

    const response = await client.fetch(getTodo, {
      params: {
        id: '1',
      },
    });

    expect(response).toHaveProperty('statusCode', 200);

    expect(response).toHaveProperty('statusText', 'OK');

    expect(response).toHaveProperty('body', expectation);
  });

  it('should not return a todo that doesn\'t exist', async () => {
    await expect(client.fetch(getTodo, {
      params: {
        id: '999',
      },
    })).rejects.toMatchObject({
      response: {
        statusCode: httpStatusCodes.NOT_FOUND,
        statusText: httpStatusCodes.getStatusText(httpStatusCodes.NOT_FOUND),
        body: '',
      },
    });
  });

  it('should add a todo', async () => {
    const title = 'Create a todo app';
    const isCompleted = true;

    const expectedLength = todos.length + 1;
    const id = `${expectedLength}`;

    const response = await client.fetch(createTodo, {
      body: {
        title,
        isCompleted,
      },
    });

    expect(response).toHaveProperty('statusCode', 200);

    expect(response).toHaveProperty('statusText', 'OK');

    expect(response).toHaveProperty('body', {
      id,
      title,
      isCompleted,
    });

    expect(todos).toHaveLength(expectedLength);
  });

  it('should update todo', async () => {
    const valuesToUpdate = {
      title: 'Do taxes',
      isCompleted: false,
    };

    const expectation = {
      ...valuesToUpdate,
      id: '1',
    };

    const actual = await client.fetch(updateTodo, {
      params: { id: '1' },
      body: valuesToUpdate,
    });

    expect(actual).toHaveProperty('statusCode', 200);

    expect(actual).toHaveProperty('statusText', 'OK');

    expect(actual).toHaveProperty('body', expectation);
  });

  it('should not update todo when todo is invalid', async () => {
    const valuesToUpdate = {
      title: '',
      isCompleted: false,
    };

    let error: any;
    try {
      await client.fetch(updateTodo, {
        params: { id: '1' },
        body: valuesToUpdate,
      });
    } catch (err) {
      error = err;
    }

    if (!error) {
      throw new Error('Expected fetch to reject with a validation error');
    }

    expect(error).toHaveProperty(['response', 'statusCode'], 400);
    expect(error).toHaveProperty(['response', 'body', 'name'], 'ValidationError');
    expect(error).toHaveProperty(['response', 'body', 'details', '0', 'path'], ['title']);
    expect(error).toHaveProperty(['response', 'body', 'details', '0', 'message'], '"title" is not allowed to be empty');
  });

  it('should delete todo', async () => {
    const id = '2';

    const expectedLength = todos.length - 1;

    const actual = await client.fetch(deleteTodo, {
      params: {
        id,
      },
    });

    expect(actual).toHaveProperty('statusCode', 204);

    expect(actual).toHaveProperty('statusText', 'No Content');

    expect(actual).toHaveProperty('body', '');

    expect(todos).toHaveLength(expectedLength);

    expect(todos.some((p) => p.id === id)).toBe(false);
  });

  it('should use middleware to return a x-response-time header', async () => {
    const response = await client.fetch(getTodos);

    expect(response).toHaveProperty(['headers', 'x-response-time'], expect.stringMatching(/^\d+ms$/i));
  });

  it('should use middleware to log requests', async () => {
    await client.fetch(getTodos);
    expect(loggerService.info).toHaveBeenCalledWith(expect.stringMatching(/^GET\s\/todos\s-\s\d+ms$/i));
  });

  it('should return a 404', async () => {
    const res = await axios.get(
      `${server.serverAddress}/some-route/that-does-not-exist`,
      {
        validateStatus: () => true,
      },
    );
    expect(res.status).toBe(404);
  });
});
