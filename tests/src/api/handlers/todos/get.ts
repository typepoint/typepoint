import { injectable } from 'inversify';

import { EndpointHandler } from '../../../../../src/server';

import { getTodo } from '../../definitions';
import { TodoService } from '../../services/todoService';
import * as httpStatusCodes from 'http-status-codes';
import { NotFoundError } from '../../models/notFound';

@injectable()
export class GetTodoHandler extends EndpointHandler {
  constructor(private todoService: TodoService) {
    super();
    this.define(getTodo, context => {
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
