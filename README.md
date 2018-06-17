<p align="center">
  <img src="https://raw.githubusercontent.com/typepoint/core/master/img/logo-no-bg-wide.png" width="400" />
  <p align="center">
    Library for easily
    <i>defining, enforcing, consuming, and/or serving</i>
    <b>strongly typed</b> RESTful API endpoints
    in TypeScript.
  </p>
</p>

[![CircleCI](https://circleci.com/gh/typepoint/core.svg?style=shield)](https://circleci.com/gh/typepoint/core)

## Install
```sh
npm install @typepoint/core --save
```

TypePoint requires at least TypeScript v2.8.
```sh
npm install typescript --save-dev
```

## Usage
Let's say you need an endpoint which returns a Todo.

`shared/models/todo.d.ts`

```typescript
interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}
```

First you **define** your endpoint in a shared place

`shared/endpoints/todos/get.ts`

```typescript
import { Empty, EndpointDefinition } from '@typepoint/core/shared';

// Define this endpoint's request params, request body, and response body as well as the path
export const GetTodo = new EndpointDefinition<{ id: string }, Empty, Todo>(
  path => path.literal('todos').param('id')
);
```

Now you've defined your endpoint, lets define a **handler** for it

`server/handlers/todos/get.ts`

```typescript
import { defineHandler } from '@typepoint/core/server';

import { GetTodo } from '../shared/endpoints/todos/get.ts';
import { todoService } from './todoService';

export const GetTodoHandler = defineHandler(GetTodo, context => {
  const id = context.request.params.id;

  const todo = await todoService.get(id);

  if (todo) {
    context.response.body = todo;
  } else {
    context.response.statusCode = 404;
  }
});
```

Now we just need to tie it all together by exporting our router as middleware that our express app can use.

`server/app.ts`

```typescript
import * as express from 'express';
import { Router } from '@typepoint/core/server';
import { toMiddleware } from '@typepoint/core/server/express';

import { GetTodoHandler } from './handlers/todos/get.ts';

const app = express();

const router = new Router({
  handlers: [
    GetTodoHandler
  ]
});

// Convert router to middleware that express can use
app.use(toMiddleware(router));

const port = 3000;
app.listen(3000, () => {
  console.log(`Listening on port ${ port }`);
})
```

Then on the client side you can call your endpoint like so

`client/app.ts`

```typescript
import { TypePointClient } from '@typepoint/core/client';

import { GetTodo } from '../shared/endpoints/todos/get';

const client = new TypePointClient({
  // location of your endpoints
  server: 'https://www.example.com/api'
});

// The client will fetch https://www.example.com/api/todos/123
client.fetch(GetTodo, {
  params: { // Params will be required and strongly typed
    id: '123'
  }
}).then(response => {
  const todo = response.body; // body will be strongly typed to a Todo
  alert(todo.title);
});
```

## Note about breaking changes
Currently TypePoint is _pre_ v1.0.0, thus breaking changes may be introduced in minor versions instead of major versions. Patch versions will continue to just include bug fixes and other non breaking changes. Once TypePoint has reached 1.0.0 it will follow strict semantic versioning.

-------------------------------------------------------

Got an problem or suggestion? Submit an [issue](https://github.com/typepoint/typepoint/issues)!

Want to contribute? Fork the [repository](https://github.com/typepoint/typepoint) and submit a pull request! 😸
