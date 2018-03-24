import { defineEndpoint } from '../../../../../src/shared';
import { Todo, UpdatableTodoFields } from '../../models/todo';
import { HasId } from '../../models/hasId';

export const updateTodo = defineEndpoint<HasId, UpdatableTodoFields, Todo>('PUT', '/todos/:id');
