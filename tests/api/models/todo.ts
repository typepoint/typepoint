import { ObjectOmit } from 'typelevel-ts';

import { HasId } from './hasId';

export class Todo implements HasId {
  id: string = '';
  title: string = '';
  isCompleted: boolean = false;
}

export type UpdatableTodoFields = ObjectOmit<Todo, 'id'>;
