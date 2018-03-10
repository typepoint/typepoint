import { warnIfWindowDetected } from './server/clientDetection';
import { EndpointContext, EndpointDefinition, Request, Response } from './shared';
import { Constructor } from './shared/constructor';

warnIfWindowDetected(this.window, this.console);

type EndpointHandlerFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  (context: TEndpointDefinition['context']) => Promise<void>;

export abstract class EndpointHandler {
  private definition: EndpointDefinition<any, any, any>;
  private handler: (context: EndpointContext<any, any, any>) => Promise<void>;

  public handle(context: EndpointContext<any, any, any>) {
    return this.handler(context);
  }

  protected define<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    handler: EndpointHandlerFunction<TEndpointDefinition>
  ) {
    this.definition = definition;
    this.handler = handler;
  }
}

function handleEndpoint<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  definition: TEndpointDefinition,
  handler: EndpointHandlerFunction<TEndpointDefinition>
): Constructor<EndpointHandler> {
  class AnonymousEndpointHandler extends EndpointHandler {
    constructor() {
      super();
      this.define(definition, handler);
    }
  }

  return AnonymousEndpointHandler;
}

interface RouterIoc {
  get<T>(Class: Constructor<T>): T;
}

interface RouterOptions {
  ioc?: RouterIoc;
}

export class Router {
  protected readonly handlerClasses: Array<Constructor<EndpointHandler>> = [];
  protected handlers: EndpointHandler[] | undefined;

  private readonly ioc: RouterIoc;

  constructor(options?: RouterOptions) {
    this.ioc = (options && options.ioc) || {
      get: <T>(Class: Constructor<T>) => {
        return new Class();
      }
    };
  }

  public use(...handlers: Array<Constructor<EndpointHandler>>): this {
    this.handlerClasses.push(...handlers);
    this.handlers = undefined;
    return this;
  }

  protected async handle(req: Request<any, any>, res: Response<any>) {
    if (!this.handlers) {
      this.handlers = this.createHandlers();
    }

    // async function handleAllRoutes()
  }

  private createHandlers(): EndpointHandler[] {
    const result: EndpointHandler[] = this.handlerClasses.map(Handler => {
      const handler = this.ioc.get(Handler);
      return handler;
    });
    return result;
  }
}
