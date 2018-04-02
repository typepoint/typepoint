import { IEndpointHandler } from '../server';
import { HttpMethod } from '../shared/http';
import { PathHelperParseMatch } from '../shared/pathHelper';
import { parseQueryString, parseUrl } from '../shared/url';

export interface HandlerMatch {
  type: 'handler' | 'middleware';
  handler: IEndpointHandler;
  parsedUrl: PathHelperParseMatch;
}

export class HandlerMatchIterator {
  private handlerIndex: number = 0;

  constructor(
    private handlers: IEndpointHandler[],
    private request: { method: HttpMethod, url: string }) {
  }

  getNextMatch(): HandlerMatch | undefined {
    while (this.handlerIndex < this.handlers.length) {
      const handler = this.handlers[this.handlerIndex++];
      if (handler.match) {
        const parsedUrl = handler.match(this.request);
        if (parsedUrl) {
          return {
            type: 'handler',
            handler,
            parsedUrl
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
            params
          }
        };
      }
    }
    return undefined;
  }
}
