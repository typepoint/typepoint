import { injectable } from 'inversify';

import { EndpointHandler } from '../../../../../server';

import { updateTodo } from '../../definitions';
import { TodoService } from '../../services/todoService';

@injectable()
export class UpdateTodoHandler extends EndpointHandler {
  constructor(private todoService: TodoService) {
    super();

    this.define(updateTodo, context => {
      const todo = todoService.update(context.request.params.id, context.request.body);
      context.response.body = todo;
    });
  }
}
