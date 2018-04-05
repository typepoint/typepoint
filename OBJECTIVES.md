# Project Objectives

## Project
- ✔ Add pre-commit checks
- □ Add documentation to README

## Endpoint Definitions
- ✔ ~~Each endpoint definition should capture the following:~~
  - ✔ ~~Method~~
  - ✔ ~~Path~~
  - ✔ ~~Request Params Type~~
  - ✔ ~~Request Body Type~~
  - ✔ ~~Response Body Type~~
  - ✔ Define endpoint using classes
  - ✔ Way to specify arrays
  - □ Validation of request input
  - □ Coercion of request input to correct types
  - ↓ Allow easy decoration for permissions

## Endpoint Handlers
- ✔ ~~Ability to have services you need injected for testability~~
- ✔ ~~Read access to typed versions of request~~
- ✔ ~~Read/Write access to typed response body~~
- □ Access to extra typed attachments like User, etc
- ✔ Ability to not handle route in a handler
- ✔ Read request headers
- ✔ Write response headers
- □ Read request cookies
- □ Write response cookies
- ✔ ~~Rendering views not required~~

## Router
- ✔ Support for middleware
- □ Ability to extend context with extra metadata
- □ Nested routers?
- □ Should gracefully handle uncaught server errors
- □ Should allow providing your own error handler

## Client
- ✔ ~~Ability to call endpoint by providing definition and be forced to provide required params, body, etc~~
- ✔ ~~Not have to pass params or body in options if they are not required~~
- □ Fetch failure should return error with response of StrongPointClientResponse
