import { createHandler } from '@typepoint/server';
import { getTodosEndpoint } from '../../definitions/todos/getTodosEndpoint';
import { getTodos } from '../../services/todoService';

export const getTodosHandler = createHandler(getTodosEndpoint, ({ response }) => {
  response.body = getTodos();
});
