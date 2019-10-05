import { Empty, EndpointDefinition } from '../../../../src/shared';
import { Todo, UpdatableTodoFields } from '../../models/todo';

export const createTodo = new EndpointDefinition<Empty, UpdatableTodoFields, Todo>(
  'POST', path => path.literal('todos')
);
