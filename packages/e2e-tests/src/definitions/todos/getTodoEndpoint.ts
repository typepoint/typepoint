import { defineEndpoint, Empty } from '@typepoint/shared';
import { HasId } from '../../models/hasId';
import { Todo } from '../../models/todo';

export const getTodoEndpoint = defineEndpoint<HasId, Empty, Todo>(
  (path) => path.literal('todos').param('id'),
);
