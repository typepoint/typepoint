import { defineEndpoint, Empty, EndpointDefinition } from '../../../../src/shared';
import { Todo } from '../../models/todo';
import { HasId } from '../../models/hasId';

export const getTodo = defineEndpoint<HasId, Empty, Todo>('/todos/:id');
