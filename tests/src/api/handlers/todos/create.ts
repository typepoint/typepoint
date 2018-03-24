import { injectable } from 'inversify';

import { EndpointHandler } from '../../../../../src/server';

import { createTodo } from '../../definitions';
import { TodoService } from '../../services/todoService';

@injectable()
export class CreateTodoHandler extends EndpointHandler {
  constructor(private todoService: TodoService) {
    super();
    this.define(createTodo, context => {
      const todo = this.todoService.add(context.request.body);
      context.response.body = todo;
    });
  }
}