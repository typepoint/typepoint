import { NotFoundError } from '../models/notFound';
import { Todo, UpdatableTodoFields } from '../models/todo';
import { DataStore } from '../db/dataStore';
import { injectable, inject } from 'inversify';

@injectable()
export class TodoService {
  constructor(private dataStore: DataStore) {
  }

  private getTodoIndexById(id: string): number {
    const index = this.dataStore.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      throw new NotFoundError('Todo not found');
    }
    return index;
  }

  add(todo: UpdatableTodoFields): Todo {
    const result = {
      ...todo,
      id: `${ this.dataStore.todos.length + 1 }`
    };
    this.dataStore.todos.push(result);
    return result;
  }

  get(id: string): Todo {
    return this.dataStore.todos[this.getTodoIndexById(id)];
  }

  getAll(): Todo[] {
    return this.dataStore.todos;
  }

  update(id: string, values: UpdatableTodoFields): Todo {
    const todo = this.dataStore.todos[this.getTodoIndexById(id)];
    todo.title = values.title;
    todo.isCompleted = values.isCompleted;
    return todo;
  }

  remove(id: string): void {
    const index = this.getTodoIndexById(id);
    this.dataStore.todos.splice(index, 1);
  }
}
