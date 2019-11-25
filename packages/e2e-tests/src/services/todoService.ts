import * as fixtures from '@typepoint/fixtures';
import { NotFoundError } from '../models/notFound';
import { Todo, UpdatableTodoFields } from '../models/todo';

const todos: Todo[] = fixtures.getTodos();

const getTodoIndexById = (id: string): number => {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    throw new NotFoundError('Todo not found');
  }
  return index;
};

export const addTodo = (todo: UpdatableTodoFields): Todo => {
  const addedTodo = {
    ...todo,
    id: `${todos.length + 1}`,
  };
  todos.push(addedTodo);
  return addedTodo;
};

export const getTodo = (id: string): Todo => {
  const index = getTodoIndexById(id);
  return todos[index];
};

export const getTodos = (): Todo[] => todos;

export const updateTodo = (id: string, values: UpdatableTodoFields): Todo => {
  const indexToUpdate = getTodoIndexById(id);
  const updatedTodo = {
    ...todos[indexToUpdate],
    title: values.title,
    isCompleted: values.isCompleted,
  };
  todos[indexToUpdate] = updatedTodo;
  return updatedTodo;
};

export const deleteTodo = (id: string): void => {
  const indexToRemove = getTodoIndexById(id);
  todos.splice(indexToRemove, 1);
};
