import { defineEndpoint, Empty, EndpointDefinition } from '../../../../src/shared';
import { HasId } from '../../models/hasId';
import { Todo } from '../../models/todo';

export const getTodo = defineEndpoint<HasId, Empty, Todo>('/todos/:id');
