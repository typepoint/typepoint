import { escapeRegExp } from './regexp';
import { ParsedUrl, parseQueryString, parseUrl, QueryParameterValues } from './url';

export class UnsupportedPathPatternError extends Error {
  constructor(path: string) {
    super(`Unsupported path pattern: "${ path }"`);
  }
}

export class RequiredPathParametersNotFound extends Error {
  constructor(parameterNames: string[]) {
    super(`Required path parameters not found: ${ parameterNames.join(', ') }`);
  }
}

export interface PathHelperParseMatch extends ParsedUrl {
  params: { [key: string]: any };
}

export interface ParsedPathPattern extends ParsedUrl {
  parameters: string[];
}

export interface GetUrlOptions {
  params?: { [key: string]: any } | undefined;
  server?: string | undefined;
}

export class PathHelper {
  static parsePathPattern(pathPattern: string): ParsedPathPattern {
    const parsedUrl = parseUrl(pathPattern);

    const parameters = this.getParameterNamesFromPathPattern(parsedUrl.path);

    return {
      ...parsedUrl,
      parameters
    };
  }

  private static generateParseFunction(
    parsedPathPattern: ParsedPathPattern
  ): (path: string) => (PathHelperParseMatch | undefined) {
    const parameterNames: string[] = [];
    const getParameterPlaceholder = (index: number) => `-----${ index }-----`;

    let pathParametersRegExpPattern = parsedPathPattern.path.replace(this.getPathPatternParameterRegExp(), (_, key) => {
      parameterNames.push(key);
      return getParameterPlaceholder(parameterNames.length - 1);
    });

    pathParametersRegExpPattern = escapeRegExp(pathParametersRegExpPattern);
    for (let parameterIndex = 0; parameterIndex < parameterNames.length; parameterIndex++) {
      pathParametersRegExpPattern = pathParametersRegExpPattern
        .replace(escapeRegExp(getParameterPlaceholder(parameterIndex)), '([^&?\/\\\\]+)');
    }
    pathParametersRegExpPattern = '^' + pathParametersRegExpPattern + '$';

    const pathParametersRegEx = new RegExp(pathParametersRegExpPattern, 'i');

    return (path: string): PathHelperParseMatch | undefined => {
      const parsedUrl = parseUrl(path);

      // Test url and extract path parameters
      pathParametersRegEx.lastIndex = -1;
      const parameterValues: string[] = [];
      const match = pathParametersRegEx.exec(parsedUrl.path);
      if (!match) {
        return undefined;
      }

      const result: PathHelperParseMatch = {
        ...parsedUrl,
        params: {}
      };

      // Add path parameters to result
      if (match.length > 1) {
        for (let parameterIndex = 1; parameterIndex < match.length; parameterIndex++) {
          const parameterName = parameterNames[parameterIndex - 1];
          const parameterValue = match[parameterIndex];
          result.params[parameterName] = parameterValue;
        }
      }

      // Extract and add query string parameters to result
      const queryStringParameters = parseQueryString(parsedUrl.postPath);
      for (const parameterName of Object.getOwnPropertyNames(queryStringParameters)) {
        const parameterValue = queryStringParameters[parameterName];
        result.params[parameterName] = parameterValue;
      }

      return result;
    };
  }

  private static getPathPatternParameterRegExp = () => /\:([^\s\/\?\n\d][^\s\/\?\n]*)/gim;

  private static getPathAndQueryStringSplitterRegExp = () => /^([^\?\n] +)(\?.*)?$/i;

  private static getParameterNamesFromPathPattern(pathPattern: string) {
    const parameterNames: string[] = [];
    const pathParameterRegExp = PathHelper.getPathPatternParameterRegExp();
    while (true) {
      const parametersMatch = pathParameterRegExp.exec(pathPattern);
      if (parametersMatch) {
        parameterNames.push(parametersMatch[1]);
      } else {
        break;
      }
    }
    return parameterNames;
  }

  private static checkForQueryString(path: string) {
    if (path.indexOf('?') > -1) {
      throw new UnsupportedPathPatternError(path);
    }
  }

  private readonly parsedPathPattern = PathHelper.parsePathPattern(this.pathPattern);

  // tslint:disable-next-line:member-ordering
  readonly parse = PathHelper.generateParseFunction(this.parsedPathPattern);

  constructor(readonly pathPattern: string) {
    PathHelper.checkForQueryString(pathPattern);
  }

  url(options?: GetUrlOptions): string {
    const params = (options && options.params) || {};
    const server = (options && options.server) || '';

    const providedParameterNames = params ? Object.getOwnPropertyNames(params) : [];
    const missingParameterNames: string[] = [];
    const queryStringParameterNames: string[] = [];

    for (const requiredParameterName of this.parsedPathPattern.parameters) {
      const isRequiredParameterProvided = providedParameterNames.some(
        parameterName => parameterName === requiredParameterName
      );
      if (!isRequiredParameterProvided) {
        missingParameterNames.push(requiredParameterName);
      }
    }

    for (const providedParameterName of providedParameterNames) {
      const isProvidedParameterRequired = this.parsedPathPattern.parameters.some(
        parameterName => parameterName === providedParameterName
      );
      if (!isProvidedParameterRequired) {
        queryStringParameterNames.push(providedParameterName);
      }
    }

    if (missingParameterNames.length) {
      throw new RequiredPathParametersNotFound(missingParameterNames);
    }

    let url = this.pathPattern.replace(/:([^\s\/\?\n\d][^\s\/\?\n]*)/gim, (_, key) => {
      let parameterValue = params[key];
      parameterValue = typeof parameterValue === 'undefined' ? '' : parameterValue;
      return parameterValue;
    });

    const queryString = queryStringParameterNames
      .map(parameterName => encodeURIComponent(parameterName) + '=' + encodeURIComponent(params[parameterName]))
      .join('&');

    if (queryString) {
      url = url + (url.indexOf('?') === -1 ? '?' : '&') + queryString;
    }

    if (server) {
      url = server + url;
    }

    return url;
  }
}
