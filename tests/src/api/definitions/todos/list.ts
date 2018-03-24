import { defineEndpoint, Empty } from '../../../../../src/shared';
import { Todo } from '../../models/todo';

export const getTodos = defineEndpoint<Empty, Empty, Todo[]>('/todos');
