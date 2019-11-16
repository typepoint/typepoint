import { createHandler } from '@typepoint/server';
import { NOT_FOUND } from 'http-status-codes';
import { getTodoEndpoint } from '../../definitions/todos/getTodoEndpoint';
import { getTodo } from '../../services/todoService';

export const getTodoHandler = createHandler(getTodoEndpoint, ({ request, response }) => {
  try {
    response.body = getTodo(request.params.id);
  } catch (err) {
    if (err && err.message === 'Todo not found') {
      response.statusCode = NOT_FOUND;
    } else {
      throw err;
    }
  }
});
