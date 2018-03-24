import { ObjectOmit } from 'typelevel-ts';

import { HasId } from './hasId';

export interface Todo extends HasId {
  title: string;
  isCompleted: boolean;
}

export type UpdatableTodoFields = ObjectOmit<Todo, 'id'>;
