import { injectable } from 'inversify';
import { EndpointHandler } from '@typepoint/server';
import * as httpStatusCodes from 'http-status-codes';
import { getTodo } from '../../definitions';
import { TodoService } from '../../services/todoService';

@injectable()
export class GetTodoHandler extends EndpointHandler {
  constructor(private todoService: TodoService) {
    super();
    this.define(getTodo, (context) => {
      try {
        context.response.body = this.todoService.get(context.request.params.id);
      } catch (err) {
        if (err && err.message === 'Todo not found') {
          context.response.statusCode = httpStatusCodes.NOT_FOUND;
        } else {
          throw err;
        }
      }
    });
  }
}
