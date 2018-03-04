import tuple from 'typed-tuple';

export const HttpMethods = tuple('GET', 'PUT', 'POST', 'PATCH', 'DELETE');

export type HttpMethod = typeof HttpMethods[number];

export class UnsupportedHttpMethod extends Error {
  constructor(method: string) {
    super(`Unsupported HTTP method: ${ method }`);
  }
}

export function cleanseHttpMethod(method: HttpMethod): HttpMethod {
  method = method.toUpperCase() as HttpMethod;
  if (!HttpMethods.some(m => m === method)) {
    throw new UnsupportedHttpMethod(method);
  }
  return method;
}
