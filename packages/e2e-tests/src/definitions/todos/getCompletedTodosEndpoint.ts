import { arrayOf, defineEndpoint, Empty } from '@typepoint/shared';
import { Todo } from '../../models/todo';

export const getCompletedTodosEndpoint = defineEndpoint({
  path: (path) => path.literal('todos').literal('completed'),
  requestParams: Empty,
  requestBody: Empty,
  responseBody: arrayOf(Todo),
});
