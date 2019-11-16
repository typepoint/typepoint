import { Empty, defineEndpoint } from '@typepoint/shared';
import { Todo, UpdatableTodoFields } from '../../models/todo';

export const addTodoEndpoint = defineEndpoint<Empty, UpdatableTodoFields, Todo>(
  'POST', (path) => path.literal('todos'),
);
