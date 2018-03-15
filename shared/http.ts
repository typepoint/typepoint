import tuple from 'typed-tuple';

// TODO: Allow for full list of standard methods as well as custom methods

export const HttpMethods = tuple('GET', 'PUT', 'POST', 'PATCH', 'DELETE');

export type HttpMethod = typeof HttpMethods[number];

export class UnsupportedHttpMethod extends Error {
  constructor(method: string) {
    super(`Unsupported HTTP method: ${ method }`);
  }
}

export function cleanseHttpMethod(method: string): HttpMethod {
  method = method.toUpperCase();
  if (!HttpMethods.some(m => m === method)) {
    throw new UnsupportedHttpMethod(method);
  }
  return method as HttpMethod;
}
