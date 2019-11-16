import { createHandler } from '@typepoint/server';
import { addTodoEndpoint } from '../../definitions/todos/addTodoEndpoint';
import { addTodo } from '../../services/todoService';

export const addTodoHandler = createHandler(addTodoEndpoint, ({ request, response }) => {
  const todo = addTodo(request.body);
  response.body = todo;
});
