import 'reflect-metadata';

import axios from 'axios';
import * as getPort from 'get-port';
import * as httpStatusCodes from 'http-status-codes';
import { TypePointClient } from '@typepoint/client';
import { addTodoEndpoint } from './definitions/todos/addTodoEndpoint';
import { getCompletedTodosEndpoint } from './definitions/todos/getCompletedTodosEndpoint';
import { getTodoEndpoint } from './definitions/todos/getTodoEndpoint';
import { getTodosEndpoint } from './definitions/todos/getTodosEndpoint';
import { deleteTodoEndpoint } from './definitions/todos/deleteTodoEndpoint';
import { updateTodoEndpoint } from './definitions/todos/updateTodoEndpoint';
import { Server } from './server';
import * as todoService from './services/todoService';
import * as loggerService from './services/loggerService';

describe('api/Sample Server', () => {
  let server: Server;
  let client: TypePointClient;

  beforeEach(async () => {
    jest.spyOn(todoService, 'addTodo');
    jest.spyOn(todoService, 'deleteTodo');
    jest.spyOn(todoService, 'getTodos');
    jest.spyOn(todoService, 'updateTodo');

    jest.spyOn(loggerService, 'info').mockImplementation(() => {});

    server = new Server(await getPort());
    await server.start();

    client = new TypePointClient({
      server: server.serverAddress,
    });
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should get list of todos', async () => {
    const response = await client.fetch(getTodosEndpoint);

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('statusText', 'OK');
    expect(response).toHaveProperty('body', [
      {
        id: '1',
        title: 'Laundry',
        isCompleted: true,
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
    ]);
  });

  it('should get list of completed todos', async () => {
    const response = await client.fetch(getCompletedTodosEndpoint);

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('statusText', 'OK');
    expect(response).toHaveProperty('body', [
      {
        id: '1',
        title: 'Laundry',
        isCompleted: true,
      },
    ]);
  });

  it('should get a todo', async () => {
    const response = await client.fetch(getTodoEndpoint, {
      params: {
        id: '1',
      },
    });

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('statusText', 'OK');
    expect(response).toHaveProperty('body', {
      id: '1',
      title: 'Laundry',
      isCompleted: true,
    });
  });

  it('should not return a todo that doesn\'t exist', async () => {
    await expect(client.fetch(getTodoEndpoint, {
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

    const response = await client.fetch(addTodoEndpoint, {
      body: {
        title,
        isCompleted,
      },
    });

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('statusText', 'OK');
    expect(response).toHaveProperty('body', {
      id: '4',
      title,
      isCompleted,
    });
  });

  it('should update todo', async () => {
    const valuesToUpdate = {
      title: 'Do taxes',
      isCompleted: false,
    };

    const actual = await client.fetch(updateTodoEndpoint, {
      params: { id: '1' },
      body: valuesToUpdate,
    });

    expect(actual).toHaveProperty('statusCode', 200);
    expect(actual).toHaveProperty('statusText', 'OK');
    expect(actual).toHaveProperty('body', {
      id: '1',
      title: 'Do taxes',
      isCompleted: false,
    });
  });

  it('should not update todo when todo is invalid', async () => {
    const valuesToUpdate = {
      title: '',
      isCompleted: false,
    };

    let error: any;
    try {
      await client.fetch(updateTodoEndpoint, {
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

  it('should delete a todo', async () => {
    const id = '2';

    const actual = await client.fetch(deleteTodoEndpoint, {
      params: {
        id,
      },
    });

    expect(actual).toHaveProperty('statusCode', 204);
    expect(actual).toHaveProperty('statusText', 'No Content');
    expect(actual).toHaveProperty('body', '');
  });

  it('should use middleware to return a x-response-time header', async () => {
    const response = await client.fetch(getTodosEndpoint);

    expect(response).toHaveProperty(['headers', 'x-response-time'], expect.stringMatching(/^\d+ms$/i));
  });

  it('should use middleware to log requests', async () => {
    await client.fetch(getTodosEndpoint);
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
