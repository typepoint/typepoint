import 'reflect-metadata';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as linq from 'linq';
import * as clone from 'clone';
import { ObjectOmit } from 'typelevel-ts';
import { Container, decorate, inject, injectable } from 'inversify';
import * as httpStatusCodes from 'http-status-codes';

import StrongPointClient from '../../../client';
import { defineEndpoint, Empty } from '../../../shared';
import { Router, EndpointHandler } from '../../../server';
import { toMiddleware } from '../../../server/express';

import { Todo } from './models/todo';
import { Server } from './server';
import * as getPort from 'get-port';
import { DataStore } from './db/dataStore';
import { TodoService } from './services/todoService';
import { getTodo, getTodos, createTodo, updateTodo, deleteTodo } from './definitions';
import {
  GetTodoHandler, GetTodosHandler, CreateTodoHandler,
  UpdateTodoHandler, DeleteTodoHandler
} from './handlers';

describe('e2e/Sample Server', () => {
  let todos: Todo[];
  let ioc: Container;
  let dataStore: DataStore;
  let server: Server;
  let client: StrongPointClient;

  before(() => {
    decorate(injectable(), EndpointHandler);
  });

  beforeEach(async function () {
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
    })

    ioc.bind(DataStore).toDynamicValue(() => new DataStore(todos));
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

  afterEach(async function () {
    this.timeout(5000);
    await server.stop();
  });

  it('should get list of todos', async () => {
    const expectation = clone(todos);

    const actual = await client.fetch(getTodos);

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

  it('should get a todo', async () => {
    const expectation = {
      id: '1',
      title: 'Laundry',
      isCompleted: false
    };

    const actual = await client.fetch(getTodo, {
      params: {
        id: '1'
      }
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
});
