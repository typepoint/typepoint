import { Empty, EndpointDefinition } from '@typepoint/shared';
import { Todo } from '../../models/todo';

export const getTodos = new EndpointDefinition<Empty, Empty, Todo[]>(
  (path) => path.literal('todos'),
);
