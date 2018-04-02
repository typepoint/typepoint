# StrongPoint

<center>
  <img src="./img/logo-blue-bg.png" width="400" />
  <p>
    Library for
    <i>defining</i>,
    <i>consuming</i>
    <i>and/or serving</i>
    <b>strongly typed</b> RESTful API endpoints
    in TypeScript.
  <p/>
</center>

## Install
```sh
npm install strongpoint --save
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
import { defineEndpoint, Empty } from 'strongpoint/shared';

// Define this endpoint's request params, request body, and response body as well as the path
const GetTodo = defineEndpoint<{ id: string }, Empty, Todo>('/todos/:id');
```

Now you've defined your endpoint, lets define a **handler** for it

`server/handlers/todos/get.ts`

```typescript
import { defineHandler } from 'strongpoint/server';

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
import { Router } from 'strongpoint/server';
import { toMiddleware } from 'strongpoint/server/express';

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
import { StrongPointClient } from 'strongpoint/client';

import { GetTodo } from '../shared/endpoints/todos/get';

const client = new StrongPointClient({
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

Issues and contributions are welcome! 😸
