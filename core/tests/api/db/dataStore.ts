import { injectable } from 'inversify';
import { Todo } from '../models/todo';

@injectable()
export class DataStore {
  constructor(public todos: Todo[] = []) {
  }
}
