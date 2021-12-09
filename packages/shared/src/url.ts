export interface ParsedUrl {
  prePath: string;
  path: string;
  postPath: string;
}

export function parseUrl(url: string): ParsedUrl {
  let index = 0;
  let pathStartIndex: number | undefined;
  let pathLength: number | undefined;

  while (index < url.length && pathLength === undefined) {
    if (pathStartIndex === undefined) {
      if (url[index] === '/') {
        if (url[index + 1] === '/') {
          index += 2;
        } else {
          pathStartIndex = index;
          index++;
        }
      } else {
        index++;
      }
    } else if (url[index] === '#' || url[index] === '?') {
      pathLength = index - pathStartIndex;
    } else {
      index++;
    }
  }

  if (pathStartIndex !== undefined && pathLength === undefined) {
    pathLength = url.length - pathStartIndex;
  }

  const prePath = url.substring(0, pathStartIndex === undefined ? url.length + 1 : pathStartIndex);
  const path = pathStartIndex === undefined ? '' : url.substr(pathStartIndex, pathLength);
  const postPath = (
    (pathStartIndex === undefined || pathLength === undefined)
      ? ''
      : url.substr(pathStartIndex + pathLength)
  );

  return {
    prePath,
    path,
    postPath,
  };
}

export interface QueryParameterValues {
  [key: string]: string | string[];
}

export function parseQueryString(queryString: string): QueryParameterValues {
  const result: QueryParameterValues = {};

  // eslint-disable-next-line no-shadow
  enum Position {
    key,
    value
  }

  const trimmedQueryString = queryString.trim();

  if (trimmedQueryString[0] !== '?') {
    return result;
  }

  let position = Position.key;
  let parameterName = '';
  let parameterValue = '';

  const addParameter = () => {
    const decodedValue = decodeURIComponent(parameterValue);
    const existingValue = result[parameterName];
    if (existingValue === undefined) {
      result[parameterName] = decodedValue;
    } else if (typeof existingValue === 'string') {
      result[parameterName] = [existingValue, decodedValue];
    } else {
      existingValue.push(decodedValue);
    }
    parameterName = '';
    parameterValue = '';
  };

  let index = 1;
  while (index < trimmedQueryString.length) {
    const char = trimmedQueryString[index];
    if (char === '#') {
      break;
    }
    if (position === Position.key) {
      if (char === '=') {
        position = Position.value;
      } else if (char === '&') {
        addParameter();
      } else {
        parameterName += char;
      }
    } else if (char === '&') {
      addParameter();
      position = Position.key;
    } else {
      parameterValue += char;
    }
    index++;
  }

  if (parameterName) {
    addParameter();
  }

  return result;
}

export function addQueryStringToUrl(url: string, queryString: string) {
  const index = url.indexOf('?');
  const endsWithQuestionMark = index === url.length - 1;

  let separator = '';

  if (index === -1) {
    separator = '?';
  } else if (!endsWithQuestionMark) {
    separator = '&';
  }

  url = url + separator + queryString;
  return url;
}
