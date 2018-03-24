import { Todo } from '../models/todo';
import { injectable } from 'inversify';

@injectable()
export class DataStore {
  constructor(public todos: Todo[] = []) {
  }
}
