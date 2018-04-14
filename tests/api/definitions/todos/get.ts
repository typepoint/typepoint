import { Empty, EndpointDefinition } from '../../../../src/shared';
import { HasId } from '../../models/hasId';
import { Todo } from '../../models/todo';

export const getTodo = new EndpointDefinition<HasId, Empty, Todo>(
  path => path.literal('todos').param('id')
);
