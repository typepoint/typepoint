import { HasId } from './hasId';

export class Todo implements HasId {
  id = '';

  title = '';

  isCompleted = false;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type UpdatableTodoFields = Omit<Todo, 'id'>;

export const getTodos = (): Todo[] => [
  {
    id: '1',
    title: 'Laundry',
    isCompleted: true,
  },
  {
    id: '2',
    title: 'Washing up',
    isCompleted: false,
  },
  {
    id: '3',
    title: 'Walk the cats',
    isCompleted: false,
  },
];
