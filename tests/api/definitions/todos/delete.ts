import { defineEndpoint, Empty, EndpointDefinition } from '../../../../src/shared';
import { HasId } from '../../models/hasId';
import { Todo } from '../../models/todo';

export const deleteTodo = defineEndpoint<HasId, Empty, Todo>('DELETE', '/todos/:id');
