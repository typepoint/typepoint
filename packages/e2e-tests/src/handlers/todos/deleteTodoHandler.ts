import { NO_CONTENT } from 'http-status-codes';
import { createHandler } from '@typepoint/server';
import { deleteTodoEndpoint } from '../../definitions/todos/deleteTodoEndpoint';
import { deleteTodo } from '../../services/todoService';

export const deleteTodoHandler = createHandler(deleteTodoEndpoint, ({ request, response }) => {
  deleteTodo(request.params.id);
  response.statusCode = NO_CONTENT;
});
