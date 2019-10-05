import { Empty, EndpointDefinition } from '../../../../src/shared';
import { HasId } from '../../models/hasId';
import { Todo } from '../../models/todo';

export const deleteTodo = new EndpointDefinition<HasId, Empty, Todo>(
  'DELETE', path => path.literal('todos').param('id')
);
