// TODO: Allow for full list of standard methods as well as custom methods

export const HttpMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'] as const;

export type HttpMethod = typeof HttpMethods[number];

export class UnsupportedHttpMethod extends Error {
  constructor(method: string) {
    super(`Unsupported HTTP method: ${method}`);
  }
}

export function cleanseHttpMethod(method: string): HttpMethod {
  const upperMethod = method.toUpperCase();
  if (!HttpMethods.some((m) => m === upperMethod)) {
    throw new UnsupportedHttpMethod(upperMethod);
  }
  return upperMethod as HttpMethod;
}
