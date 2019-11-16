import { defineEndpoint, Empty } from '@typepoint/shared';
import { HasId } from '../../models/hasId';
import { Todo } from '../../models/todo';

export const deleteTodoEndpoint = defineEndpoint<HasId, Empty, Todo>(
  'DELETE', (path) => path.literal('todos').param('id'),
);
