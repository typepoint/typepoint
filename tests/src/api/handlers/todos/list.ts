import { injectable, inject } from 'inversify';

import { EndpointHandler } from '../../../../../src/server';

import { getTodos } from '../../definitions';
import { TodoService } from '../../services/todoService';

@injectable()

export class GetTodosHandler extends EndpointHandler {
  constructor(private todoService: TodoService) {
    super();
    this.define(getTodos, context => {
      context.response.body = this.todoService.getAll();
    });
  }
}
