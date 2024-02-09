import * as jf from 'joiful';
import { defineEndpoint } from '@typepoint/shared';
import { Todo, UpdatableTodoFields } from '../../models/todo';

export class UpdateTodoRequestParams {
  @jf.string().min(1).required()
    id!: string;
}

export class UpdateTodoRequestBody implements UpdatableTodoFields {
  @jf.string().required()
    title = '';

  @jf.boolean().required()
    isCompleted = false;
}

export const updateTodoEndpoint = defineEndpoint({
  method: 'PUT',
  path: (path) => path.literal('todos').param('id'),
  requestParams: UpdateTodoRequestParams,
  requestBody: UpdateTodoRequestBody,
  responseBody: Todo,
});
