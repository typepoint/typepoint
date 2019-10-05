import { inject, injectable } from 'inversify';

import { EndpointHandler } from '../../../../src/server';

import { getCompletedTodos } from '../../definitions';
import { TodoService } from '../../services/todoService';

@injectable()
export class GetCompletedTodosHandler extends EndpointHandler {
  constructor(private todoService: TodoService) {
    super();
    this.define(getCompletedTodos, context => {
      const todos = this.todoService
        .getAll()
        .filter(todo => todo.isCompleted);
      context.response.body = todos;
    });
  }
}
