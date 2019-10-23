import {
  arrayOf,
  Empty,
  EndpointDefinition,
} from '@typepoint/shared';
import { Todo } from '../../models/todo';

export const getCompletedTodos = new EndpointDefinition({
  path: (path) => path.literal('todos').literal('completed'),
  requestParams: Empty,
  requestBody: Empty,
  responseBody: arrayOf(Todo),
});
