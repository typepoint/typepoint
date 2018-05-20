import axios from 'axios';
import { assert, expect } from 'chai';
import 'chai-as-promised';
import * as clone from 'clone';
import * as getPort from 'get-port';
import * as httpStatusCodes from 'http-status-codes';
import { Container, decorate, inject, injectable } from 'inversify';
import * as linq from 'linq';
import 'reflect-metadata';
import * as sinon from 'sinon';
import { ObjectOmit } from 'typelevel-ts';

import { StrongPointClient } from '../../src/client';
import { EndpointHandler, EndpointMiddleware, NotFoundMiddleware, Router } from '../../src/server';
import { toMiddleware } from '../../src/server/express';
import { Empty } from '../../src/shared';

import partialMockOf from '../../tests/infrastructure/mockOf';
import { DataStore } from './db/dataStore';
import { createTodo, deleteTodo, getTodo, getTodos, updateTodo } from './definitions';
import {
  CreateTodoHandler, DeleteTodoHandler, GetTodoHandler,
  GetTodosHandler, UpdateTodoHandler
} from './handlers';
import { RequestLoggerMiddleware } from './middleware/requestLogger';
import { ResponseTimeMiddleware } from './middleware/responseTime';
import { Todo } from './models/todo';
import { Server } from './server';
import { LoggerService } from './services/loggerService';
import { TodoService } from './services/todoService';

describe('api/Sample Server', () => {
  let todos: Todo[];
  let ioc: Container;
  let server: Server;
  let client: StrongPointClient;
  let loggerService: LoggerService;

  before(() => {
    decorate(injectable(), EndpointHandler);
    decorate(injectable(), EndpointMiddleware);
    decorate(injectable(), NotFoundMiddleware);
  });

  beforeEach(async function() {
    // Allow server some time to spin up
    this.timeout(5000);

    // Configure ioc
    todos = [
      {
        id: '1',
        title: 'Laundry',
        isCompleted: false
      },
      {
        id: '2',
        title: 'Washing up',
        isCompleted: false
      },
      {
        id: '3',
        title: 'Walk the cats',
        isCompleted: false
      }
    ];
    ioc = new Container({
      defaultScope: 'Singleton',
      // autoBindInjectable: true
    });

    loggerService = partialMockOf<LoggerService>({
      info: sinon.spy(),
      warn: sinon.spy(),
      error: sinon.spy()
    });

    ioc.bind(NotFoundMiddleware).toSelf();
    ioc.bind(DataStore).toDynamicValue(() => new DataStore(todos));
    ioc.bind(LoggerService).toDynamicValue(() => loggerService);
    ioc.bind(ResponseTimeMiddleware).toSelf();
    ioc.bind(RequestLoggerMiddleware).toSelf();
    ioc.bind(TodoService).toSelf();
    ioc.bind(CreateTodoHandler).toSelf();
    ioc.bind(DeleteTodoHandler).toSelf();
    ioc.bind(GetTodoHandler).toSelf();
    ioc.bind(GetTodosHandler).toSelf();
    ioc.bind(UpdateTodoHandler).toSelf();

    const port = await getPort();

    server = new Server(port, ioc);
    server.start();

    client = new StrongPointClient({
      server: server.serverAddress
    });
  });

  afterEach(async function() {
    this.timeout(5000);
    await server.stop();
  });

  it('should get list of todos', async () => {
    const expectation = clone(todos);

    const response = await client.fetch(getTodos);

    expect(response)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(response)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(response)
      .to.have.property('body')
      .that.deep.equals(expectation);
  });

  it('should get a todo', async () => {
    const expectation = {
      id: '1',
      title: 'Laundry',
      isCompleted: false
    };

    const response = await client.fetch(getTodo, {
      params: {
        id: '1'
      }
    });

    expect(response)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(response)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(response)
      .to.have.property('body')
      .that.deep.equals(expectation);
  });

  it(`should not return a todo that doesn't exist`, async () => {
    await client.fetch(getTodo, {
      params: {
        id: '999'
      }
    }).then(() => {
      assert.fail('Expected fetch to return a promise rejection');
    }, err => {
      expect(err)
        .to.have.property('response')
        .to.have.property('status', httpStatusCodes.NOT_FOUND);

      expect(err)
        .to.have.property('response')
        .to.have.property('statusText', httpStatusCodes.getStatusText(httpStatusCodes.NOT_FOUND));

      expect(err)
        .to.have.property('response')
        .to.not.have.property('body');
    });
  });

  it('should add a todo', async () => {
    const title = 'Create a todo app';
    const isCompleted = true;

    const expectedLength = todos.length + 1;
    const id = `${ expectedLength }`;

    const response = await client.fetch(createTodo, {
      body: {
        title,
        isCompleted
      }
    });

    expect(response)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(response)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(response)
      .to.have.property('body')
      .that.deep.equals({
        id,
        title,
        isCompleted
      });

    expect(todos).to.have.lengthOf(expectedLength);
  });

  it('should update todo', async () => {
    const valuesToUpdate = {
      title: 'Do taxes',
      isCompleted: false,
    };

    const expectation = {
      ...valuesToUpdate,
      id: '1'
    };

    const actual = await client.fetch(updateTodo, {
      params: { id: '1' },
      body: valuesToUpdate
    });

    expect(actual)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(actual)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(actual)
      .to.have.property('body')
      .that.deep.equals(expectation);
  });

  it('should not update todo when todo is invalid', async () => {
    const valuesToUpdate = {
      title: '',
      isCompleted: false
    };

    let error: any;
    try {
      await client.fetch(updateTodo, {
        params: { id: '1' },
        body: valuesToUpdate
      });
    } catch (err) {
      error = err;
    }

    if (!error) {
      assert.fail(undefined, undefined, 'Expected fetch to reject with a validation error');
    }

    expect(error)
      .to.have.property('response')
      .that.has.property('status', 400);

    expect(error)
      .to.have.property('response')
      .that.has.property('data')
      .that.has.property('name', 'ValidationError');

    expect(error)
      .to.have.property('response')
      .that.has.property('data')
      .that.has.property('details')
      .that.has.property('0')
      .that.has.property('path', 'title');

    expect(error)
      .to.have.property('response')
      .that.has.property('data')
      .that.has.property('details')
      .that.has.property('0')
      .that.contains({
        message: '"title" is not allowed to be empty'
      });
  });

  it('should delete todo', async () => {
    const id = '2';

    const expectedLength = todos.length - 1;

    const actual = await client.fetch(deleteTodo, {
      params: {
        id
      }
    });

    expect(actual)
      .to.have.property('statusCode')
      .that.deep.equals(204);

    expect(actual)
      .to.have.property('statusText')
      .that.deep.equals('No Content');

    expect(actual)
      .to.have.property('body')
      .that.deep.equals('');

    expect(todos).to.have.lengthOf(expectedLength);

    expect(todos.some(p => p.id === id)).to.be.false;
  });

  it('should use middleware to return a x-response-time header', async () => {
    const response = await client.fetch(getTodos);

    expect(response)
      .to.have.property('headers')
      .that.has.property('x-response-time')
      .that.matches(/^\d+ms$/i);
  });

  it('should use middleware to log requests', async () => {
    await client.fetch(getTodos);
    expect(loggerService.info).to.have.been.calledWith(sinon.match(/^GET\s\/todos\s\-\s\d+ms$/i));
  });

  it('should return a 404', async () => {
    const res = await axios.get(
      `${ server.serverAddress }/some-route/that-does-not-exist`,
      {
        validateStatus: () => true
      }
    );
    expect(res.status).to.equal(404);
  });
});
