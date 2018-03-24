import { EndpointHandler } from '../server';
import { HttpMethod } from '../shared/http';
import { PathHelperParseMatch } from '../shared/pathHelper';

export interface HandlerMatch {
  handler: EndpointHandler;
  parsedUrl: PathHelperParseMatch;
}

export class HandlerMatchIterator {
  private handlerIndex: number = 0;

  constructor(
    private handlers: EndpointHandler[],
    private request: { method: HttpMethod, url: string }) {
  }

  public getNextMatch(): HandlerMatch | undefined {
    while (this.handlerIndex < this.handlers.length) {
      const handler = this.handlers[this.handlerIndex++];
      const parsedUrl = handler.match(this.request);
      if (parsedUrl) {
        return {
          handler,
          parsedUrl
        };
      }
    }
    return undefined;
  }
}
