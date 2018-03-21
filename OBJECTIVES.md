# Project Objectives

## Endpoint Definitions
- ✔ ~~Each endpoint definition should capture the following:~~
  - ✔ ~~Method~~
  - ✔ ~~Path~~
  - ✔ ~~Request Params Type~~
  - ✔ ~~Request Body Type~~
  - ✔ ~~Response Body Type~~
  - Allow easy decoration for permissions

## Endpoint Handlers
- Ability to have services you need injected for testability
- ✔ ~~Read access to typed versions of request~~
- ✔ ~~Read/Write access to typed response body~~
- Access to extra typed attachments like User, Database, etc
- Ability to not handle route in a handler
- Read request headers
- Write response headers
- Read request cookies
- Write response cookies
- ✔ ~~Rendering views not required~~

## Router
- Support for middleware
- Ability to extend context with extra metadata
- Nested routers?
- Should gracefully handle uncaught server errors
- Should allow providing your own error handler

## Client
- ✔ ~~Ability to call endpoint by providing definition and be forced to provide required params, body, etc~~

### Middleware example in Koa
```js
const Koa = require('koa');
const app = new Koa();

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(async ctx => {
  if (ctx.req.params.id == 0) {
    next();
  } else {
    ctx.body = 'Hello World';
  }
});

app.listen(3000);
```