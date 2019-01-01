# Project Objectives

## Project
- ✔ Add pre-commit checks
- ✔ Package so that paths are optimal for consuming before publishing
- □ Add documentation to README
- □ Add proper 100% code coverage
- □ Setup Greenkeeper
- □ Setup Commitizen (or similar) and start using conventional commits
- ✔ Update package.json with correct github repository details
- □ Split express middleware into separate repository and package
- □ Split joi validation into separate repository and package
- ✔ Remove typelevel-ts now we have official support for conditional types

## Endpoint Definitions
- ✔ Each endpoint definition should capture the following:
  - ✔ Method
  - ✔ Path
  - ✔ Request Params Type
  - ✔ Request Body Type
  - ✔ Response Body Type
  - ✔ Define endpoint using classes
  - ✔ Way to specify arrays
  - ✔ Validation of request input
  - ✔ Coercion of request input to correct types
  - □ Allow decoration based authorization
  - □ Add pattern matching in path params e.g. path => path.literal('todo').number('id')

## Endpoint Handlers
- ✔ Ability to have services you need injected for testability
- ✔ Read access to typed versions of request
- ✔ Read/Write access to typed response body
- □ Access to extra typed attachments like User, etc
- ✔ Ability to not handle route in a handler
- ✔ Read request headers
- ✔ Write response headers
- ✔ Read request cookies
- ✔ Write response cookies
- ✔ Rendering views not required

## Router
- ✔ Support for middleware
- ✔ Ability to extend context with extra metadata
- ✔ Should gracefully handle uncaught server errors
- ✔ Should allow providing your own error handler
- □ Should not get warning in console regarding unhandled promise when middleware or handler throws

## Client
- ✔ Ability to call endpoint by providing definition and be forced to provide required params, body, etc
- ✔ Not have to pass params or body in options if they are not required
- ✔ Fetch failure should return error with response property of TypePointClientResponse
