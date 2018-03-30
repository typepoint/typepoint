import { expect } from 'chai';

import { TestCase } from '../../tests/infrastructure/testCase';
import { parseQueryString, parseUrl, QueryParameterValues } from './url';

describe('shared/url', () => {
  describe('parseUrl', () => {
    type ParsePathPatternTestCase = TestCase<string, { prePath: string, path: string, postPath: string }>;

    const testCases: ReadonlyArray<ParsePathPatternTestCase> = Object.freeze([
      {
        input: '',
        expected: {
          prePath: '',
          path: '',
          postPath: ''
        }
      },
      {
        input: '/',
        expected: {
          prePath: '',
          path: '/',
          postPath: ''
        }
      },
      {
        input: '/users',
        expected: {
          prePath: '',
          path: '/users',
          postPath: ''
        }
      },
      {
        input: '/users/123',
        expected: {
          prePath: '',
          path: '/users/123',
          postPath: ''
        }
      },
      {
        input: 'example.com/users/123',
        expected: {
          prePath: 'example.com',
          path: '/users/123',
          postPath: ''
        }
      },
      {
        input: 'localhost:8080/users/123',
        expected: {
          prePath: 'localhost:8080',
          path: '/users/123',
          postPath: ''
        }
      },
      {
        input: 'http://localhost:8080/users/123',
        expected: {
          prePath: 'http://localhost:8080',
          path: '/users/123',
          postPath: ''
        }
      },
      {
        input: 'www.example.com/users/123',
        expected: {
          prePath: 'www.example.com',
          path: '/users/123',
          postPath: ''
        }
      },
      {
        input: 'http://www.example.com/users/123',
        expected: {
          prePath: 'http://www.example.com',
          path: '/users/123',
          postPath: ''
        }
      },
      {
        input: 'https://www.example.com/users/123',
        expected: {
          prePath: 'https://www.example.com',
          path: '/users/123',
          postPath: ''
        }
      },
      {
        input: 'https://www.example.com/users/123?format=xml',
        expected: {
          prePath: 'https://www.example.com',
          path: '/users/123',
          postPath: '?format=xml'
        }
      },
      {
        input: 'https://www.example.com/users/123#content',
        expected: {
          prePath: 'https://www.example.com',
          path: '/users/123',
          postPath: '#content'
        }
      },
      {
        input: 'https://www.example.com/users/123?format=html#content',
        expected: {
          prePath: 'https://www.example.com',
          path: '/users/123',
          postPath: '?format=html#content'
        }
      }
    ]);

    it('should extract pre-path, path and post-path', () => {
      for (const testCase of testCases) {
        const actual = parseUrl(testCase.input);
        expect(actual).to.eql(testCase.expected);
      }
    });
  });

  describe('parseQueryString', () => {
    type ParseQueryStringTestCase = TestCase<string, QueryParameterValues>;

    const format = 'json';
    const id1 = '1';
    const id2 = '2';
    const id3 = '3';

    const testCases: ParseQueryStringTestCase[] = [
      {
        input: '',
        expected: {}
      },
      {
        input: `?format=${ format }`,
        expected: { format }
      },
      {
        input: `?format=${ format }&id=${ id1 }`,
        expected: {
          format,
          id: id1
        }
      },
      {
        input: `?format=${ format }&id=${ id1 }&id=${ id2 }&id=${ id3 }`,
        expected: {
          format,
          id: [id1, id2, id3]
        }
      },
      {
        input: `?format=${ format }&id=${ id1 }&id=${ id2 }#top`,
        expected: {
          format,
          id: [id1, id2]
        }
      },
      {
        input: `?pretty&id=${ id1 }`,
        expected: {
          pretty: '',
          id: id1
        }
      },
      {
        input: `?pretty`,
        expected: {
          pretty: ''
        }
      }
    ];

    it('should return parameter names and values', () => {
      for (const testCase of testCases) {
        const actual = parseQueryString(testCase.input);
        expect(actual).to.deep.equal(testCase.expected);
      }
    });
  });
});
