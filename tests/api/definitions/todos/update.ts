import { Required } from 'tsdv-joi/constraints/any';
import { BooleanSchema } from 'tsdv-joi/constraints/boolean';
import { Min, StringSchema } from 'tsdv-joi/constraints/string';

import { EndpointDefinition } from '../../../../src/shared';
import { HasId } from '../../models/hasId';
import { Todo, UpdatableTodoFields } from '../../models/todo';

export class UpdateTodoRequestParams {
  @Required()
  @Min(1)
  id: string = '';
}

export class UpdateTodoRequestBody implements UpdatableTodoFields {
  @Required()
  title: string = '';

  @Required()
  @BooleanSchema()
  isCompleted: boolean = false;
}

export const updateTodo = new EndpointDefinition({
  method: 'PUT',
  path: path => path.literal('todos').param('id'),
  requestParams: UpdateTodoRequestParams,
  requestBody: UpdateTodoRequestBody,
  responseBody: Todo
});
