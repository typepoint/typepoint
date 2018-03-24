import { injectable } from 'inversify';

import { EndpointHandler } from '../../../../../src/server';

import { getTodo } from '../../definitions';
import { TodoService } from '../../services/todoService';

@injectable()
export class GetTodoHandler extends EndpointHandler {
  constructor(private todoService: TodoService) {
    super();
    this.define(getTodo, context => {
      context.response.body = this.todoService.get(context.request.params.id);
    });
  }
}
