import { HasId } from './hasId';

export class Todo implements HasId {
  id: string = '';
  title: string = '';
  isCompleted: boolean = false;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type UpdatableTodoFields = Omit<Todo, 'id'>;
