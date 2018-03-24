import { defineEndpoint, Empty } from '../../../../../src/shared';
import { Todo, UpdatableTodoFields } from '../../models/todo';

export const createTodo = defineEndpoint<Empty, UpdatableTodoFields, Todo>('POST', '/todos');
