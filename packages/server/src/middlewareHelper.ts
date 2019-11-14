import {
  PathHelperParseMatch,
  parseQueryString,
  parseUrl,
} from '@typepoint/shared';
import { EndpointHandler, EndpointMiddleware } from './types';

export interface HandlerMatch {
  type: 'handler' | 'middleware';
  handler: EndpointHandler | EndpointMiddleware;
  parsedUrl: PathHelperParseMatch;
}

export class HandlerMatchIterator {
  private handlerIndex = 0;

  constructor(
    private handlers: (EndpointMiddleware | EndpointHandler)[],
    private request: { method: string; url: string },
  ) {
  }

  getNextMatch(): HandlerMatch | undefined {
    while (this.handlerIndex < this.handlers.length) {
      const handler = this.handlers[this.handlerIndex++];
      if ('match' in handler && handler.match) {
        const parsedUrl = handler.match(this.request);
        if (parsedUrl) {
          return {
            type: 'handler',
            handler,
            parsedUrl,
          };
        }
      } else {
        const parsedUrl = parseUrl(this.request.url);
        const params = parseQueryString(parsedUrl.postPath);
        return {
          type: 'middleware',
          handler,
          parsedUrl: {
            ...parsedUrl,
            params,
          },
        };
      }
    }
    return undefined;
  }
}
