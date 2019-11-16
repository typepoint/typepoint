import { createHandler } from '@typepoint/server';
import { updateTodoEndpoint } from '../../definitions/todos/updateTodoEndpoint';
import { updateTodo } from '../../services/todoService';

export const updateTodoHandler = createHandler(updateTodoEndpoint, ({ request, response }) => {
  const todo = updateTodo(request.params.id, request.body);
  response.body = todo;
});
