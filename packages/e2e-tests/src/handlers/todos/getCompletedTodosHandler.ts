import { createHandler } from '@typepoint/server';
import { getCompletedTodosEndpoint } from '../../definitions/todos/getCompletedTodosEndpoint';
import { getTodos } from '../../services/todoService';

export const getCompletedTodosHandler = createHandler(getCompletedTodosEndpoint, ({ request, response }) => {
  const todos = getTodos().filter((todo) => todo.isCompleted);
  response.body = todos;
});
