import { Empty, EndpointDefinition } from '../../../../src/shared';
import { Todo } from '../../models/todo';

export const getTodos = new EndpointDefinition<Empty, Empty, Todo[]>('/todos');
