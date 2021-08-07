import { TestCase } from 'jest-helpers';
import {
  PathHelper, UnsupportedPathPatternError, RequiredPathParametersNotFound, GetUrlOptions,
} from './pathHelper';

describe('shared/pathHelper', () => {
  describe('UnsupportedPathPatternError', () => {
    it('should have message', () => {
      expect(new UnsupportedPathPatternError('cat.meow'))
        .toHaveProperty('message', 'Unsupported path pattern: "cat.meow"');
    });
  });

  describe('RequiredPathParametersNotFound', () => {
    it('should have message', () => {
      expect(new RequiredPathParametersNotFound(['customerId', 'orderId']))
        .toHaveProperty('message', 'Required path parameters not found: customerId, orderId');
    });
  });

  describe('parsePathPattern', () => {
    it('should parse the path pattern correctly', () => {
      type ParsePathPatternTestCase = TestCase<string, { prePath: string; path: string; postPath: string }>;

      const testCases: ReadonlyArray<ParsePathPatternTestCase> = Object.freeze([
        {
          input: '/users',
          expected: {
            prePath: '',
            path: '/users',
            postPath: '',
            parameters: [],
          },
        },
        {
          input: '/users/:userId',
          expected: {
            prePath: '',
            path: '/users/:userId',
            postPath: '',
            parameters: ['userId'],
          },
        },
        {
          input: '/users/:userId/orders',
          expected: {
            prePath: '',
            path: '/users/:userId/orders',
            postPath: '',
            parameters: ['userId'],
          },
        },
        {
          input: '/users/:userId/orders/:orderId',
          expected: {
            prePath: '',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
        {
          input: 'localhost/users/:userId/orders/:orderId',
          expected: {
            prePath: 'localhost',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
        {
          input: 'example.com/users/:userId/orders/:orderId',
          expected: {
            prePath: 'example.com',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
        {
          input: 'localhost:8080/users/:userId/orders/:orderId',
          expected: {
            prePath: 'localhost:8080',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
        {
          input: 'http://localhost:8080/users/:userId/orders/:orderId',
          expected: {
            prePath: 'http://localhost:8080',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
        {
          input: 'www.example.com/users/:userId/orders/:orderId',
          expected: {
            prePath: 'www.example.com',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
        {
          input: 'http://www.example.com/users/:userId/orders/:orderId',
          expected: {
            prePath: 'http://www.example.com',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
        {
          input: 'https://www.example.com/users/:userId/orders/:orderId',
          expected: {
            prePath: 'https://www.example.com',
            path: '/users/:userId/orders/:orderId',
            postPath: '',
            parameters: ['userId', 'orderId'],
          },
        },
      ]);

      testCases.forEach((testCase) => {
        const actual = PathHelper.parsePathPattern(testCase.input);
        expect(actual).toEqual(testCase.expected);
      });
    });
  });

  describe('url', () => {
    it('should generate the url correctly', () => {
      type UrlTestCase = TestCase<{ pathPattern: string; options?: GetUrlOptions }, string>;

      const userId = '123';
      const orderId = '456';
      const format = 'xml';
      const pretty = '1';

      const testCases: ReadonlyArray<UrlTestCase> = Object.freeze([
        {
          input: {
            pathPattern: '/users',
            options: { params: {} },
          },
          expected: '/users',
        },
        {
          input: {
            pathPattern: '/users/:userId',
            options: { params: { userId } },
          },
          expected: `/users/${userId}`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders',
            options: { params: { userId } },
          },
          expected: `/users/${userId}/orders`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders',
            options: { params: { userId } },
          },
          expected: `/users/${userId}/orders`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders/:orderId',
            options: {
              params: {
                userId,
                orderId,
              },
            },
          },
          expected: `/users/${userId}/orders/${orderId}`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders/:orderId',
            options: {
              params: {
                userId,
                orderId,
                format,
              },
            },
          },
          expected: `/users/${userId}/orders/${orderId}?format=${format}`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders/:orderId',
            options: {
              params: {
                userId,
                orderId,
                format,
                pretty,
              },
            },
          },
          expected: `/users/${userId}/orders/${orderId}?format=${format}&pretty=${pretty}`,
        },
        {
          input: {
            pathPattern: 'example.com/users/:userId',
            options: { params: { userId } },
          },
          expected: `example.com/users/${userId}`,
        },
        {
          input: {
            pathPattern: 'example.com:8080/users/:userId',
            options: { params: { userId } },
          },
          expected: `example.com:8080/users/${userId}`,
        },
        {
          input: {
            pathPattern: 'wow.cool.example.com:8080/users/:userId',
            options: { params: { userId } },
          },
          expected: `wow.cool.example.com:8080/users/${userId}`,
        },
        {
          input: {
            pathPattern: 'example.com:8080/users/:userId/orders/:orderId',
            options: { params: { userId, orderId } },
          },
          expected: `example.com:8080/users/${userId}/orders/${orderId}`,
        },
        {
          input: {
            pathPattern: 'http://example.com:8080/users/:userId/orders/:orderId',
            options: { params: { userId, orderId } },
          },
          expected: `http://example.com:8080/users/${userId}/orders/${orderId}`,
        },
      ]);

      testCases.forEach((testCase) => {
        const helper = new PathHelper(testCase.input.pathPattern);
        const url = helper.url(testCase.input.options);
        expect(url).toBe(testCase.expected);
      });
    });

    it('should use server in url when server specified', () => {
      type UrlTestCase = TestCase<{ pathPattern: string; params: { [key: string]: any } }, string>;

      const server = 'https://www.example.com';
      const userId = '123';
      const orderId = '456';
      const format = 'xml';
      const pretty = '1';

      const testCases: ReadonlyArray<UrlTestCase> = Object.freeze([
        {
          input: {
            pathPattern: '/users',
            params: {},
          },
          expected: `${server}/users`,
        },
        {
          input: {
            pathPattern: '/users/:userId',
            params: { userId },
          },
          expected: `${server}/users/${userId}`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders',
            params: { userId },
          },
          expected: `${server}/users/${userId}/orders`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders',
            params: { userId },
          },
          expected: `${server}/users/${userId}/orders`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders/:orderId',
            params: {
              userId,
              orderId,
            },
          },
          expected: `${server}/users/${userId}/orders/${orderId}`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders/:orderId',
            params: {
              userId,
              orderId,
              format,
            },
          },
          expected: `${server}/users/${userId}/orders/${orderId}?format=${format}`,
        },
        {
          input: {
            pathPattern: '/users/:userId/orders/:orderId',
            params: {
              userId,
              orderId,
              format,
              pretty,
            },
          },
          expected: `${server}/users/${userId}/orders/${orderId}?format=${format}&pretty=${pretty}`,
        },
      ]);

      testCases.forEach((testCase) => {
        const helper = new PathHelper(testCase.input.pathPattern);
        const url = helper.url({
          server,
          params: testCase.input.params,
        });
        expect(url).toBe(testCase.expected);
      });
    });

    it('should error when required parameters are not provided', () => {
      type InvalidUrlTestCase = TestCase<{ pathPattern: string; params: { [key: string]: any } }, string>;
      const testCases: InvalidUrlTestCase[] = [
        {
          input: {
            pathPattern: 'http://example.com/users/:userId',
            params: {},
          },
          expected: 'Required path parameters not found: userId',
        },
        {
          input: {
            pathPattern: 'http://example.com/users/:userId/products/:productId',
            params: {},
          },
          expected: 'Required path parameters not found: userId, productId',
        },
      ];

      const createTestAction = (testCase: InvalidUrlTestCase) => () => {
        const pathHelper = new PathHelper(testCase.input.pathPattern);
        const actual = pathHelper.url(testCase.input.params);
        return actual;
      };

      testCases.forEach((testCase) => {
        const action = createTestAction(testCase);
        expect(action).toThrow(testCase.expected);
      });
    });

    it('should error on invalid url patterns', () => {
      type InvalidUrlTestCase = TestCase<{ pathPattern: string; params: { [key: string]: any } }, string>;
      const testCases: InvalidUrlTestCase[] = [
        {
          input: {
            pathPattern: 'http://example.com/users/:userId?format=:format',
            params: {},
          },
          expected: 'Unsupported path pattern: "http://example.com/users/:userId?format=:format"',
        },
      ];

      const createTestAction = (testCase: InvalidUrlTestCase) => () => {
        const pathHelper = new PathHelper(testCase.input.pathPattern);
        const actual = pathHelper.url(testCase.input.params);
        return actual;
      };

      testCases.forEach((testCase) => {
        const action = createTestAction(testCase);
        expect(action).toThrow(testCase.expected);
      });
    });
  });

  describe('parse', () => {
    it('should parse an url returning extracted values', () => {
      const userId = '123';
      const orderId = '456';
      const format = 'xml';
      const pretty = '1';

      type ParseTestCase = TestCase<{ pattern: string; path: string }, { params: { [key: string]: any } } | undefined>;

      const testCases: ReadonlyArray<ParseTestCase> = Object.freeze([
        {
          input: {
            pattern: '/users',
            path: '/users',
          },
          expected: {
            prePath: '',
            path: '/users',
            postPath: '',
            params: {},
          },
        },
        {
          input: {
            pattern: '/users/:userId',
            path: `/users/${userId}`,
          },
          expected: {
            prePath: '',
            path: `/users/${userId}`,
            postPath: '',
            params: { userId },
          },
        },
        {
          input: {
            pattern: '/users/:userId/orders',
            path: `/users/${userId}/orders`,
          },
          expected: {
            prePath: '',
            path: `/users/${userId}/orders`,
            postPath: '',
            params: { userId },
          },
        },
        {
          input: {
            pattern: '/users/:userId/orders',
            path: `/users/${userId}/orders`,
          },
          expected: {
            prePath: '',
            path: `/users/${userId}/orders`,
            postPath: '',
            params: { userId },
          },
        },
        {
          input: {
            pattern: '/users/:userId/orders/:orderId',
            path: `/users/${userId}/orders/${orderId}`,
          },
          expected: {
            prePath: '',
            path: `/users/${userId}/orders/${orderId}`,
            postPath: '',
            params: { userId, orderId },
          },
        },
        {
          input: {
            pattern: '/users/:userId/orders/:orderId',
            path: `/users/${userId}/orders/${orderId}?format=${format}`,
          },
          expected: {
            prePath: '',
            path: `/users/${userId}/orders/${orderId}`,
            postPath: `?format=${format}`,
            params: { userId, orderId, format },
          },
        },
        {
          input: {
            pattern: '/users/:userId/orders/:orderId',
            path: `/users/${userId}/orders/${orderId}?format=${format}&pretty=${pretty}`,
          },
          expected: {
            prePath: '',
            path: `/users/${userId}/orders/${orderId}`,
            postPath: `?format=${format}&pretty=${pretty}`,
            params: {
              userId, orderId, format, pretty,
            },
          },
        },
        {
          input: {
            pattern: 'example.com/users/:userId',
            path: `example.com/users/${userId}`,
          },
          expected: {
            prePath: 'example.com',
            path: `/users/${userId}`,
            postPath: '',
            params: { userId },
          },
        },
        {
          input: {
            pattern: 'example.com:8080/users/:userId',
            path: `example.com:8080/users/${userId}`,
          },
          expected: {
            prePath: 'example.com:8080',
            path: `/users/${userId}`,
            postPath: '',
            params: { userId },
          },
        },
        {
          input: {
            pattern: 'wow.cool.example.com:8080/users/:userId',
            path: `wow.cool.example.com:8080/users/${userId}`,
          },
          expected: {
            prePath: 'wow.cool.example.com:8080',
            path: `/users/${userId}`,
            postPath: '',
            params: { userId },
          },
        },
        {
          input: {
            pattern: 'example.com:8080/users/:userId/orders/:orderId',
            path: `example.com:8080/users/${userId}/orders/${orderId}`,
          },
          expected: {
            prePath: 'example.com:8080',
            path: `/users/${userId}/orders/${orderId}`,
            postPath: '',
            params: { userId, orderId },
          },
        },
        {
          input: {
            pattern: 'http://example.com:8080/users/:userId/orders/:orderId',
            path: `http://example.com:8080/users/${userId}/orders/${orderId}`,
          },
          expected: {
            prePath: 'http://example.com:8080',
            path: `/users/${userId}/orders/${orderId}`,
            postPath: '',
            params: { userId, orderId },
          },
        },
        {
          input: {
            pattern: 'http://example.com:8080/users/:userId/orders/:orderId',
            path: `http://example.com:8080/users/${userId}/orders/${orderId}?format=${format}#top`,
          },
          expected: {
            prePath: 'http://example.com:8080',
            path: `/users/${userId}/orders/${orderId}`,
            postPath: `?format=${format}#top`,
            params: { userId, orderId, format },
          },
        },
        {
          input: {
            pattern: '/products',
            path: '/products/1',
          },
          expected: undefined,
        },
      ]);

      testCases.forEach((testCase) => {
        const helper = new PathHelper(testCase.input.pattern);
        const result = helper.parse(testCase.input.path);
        if (testCase.expected === undefined) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result).toBeUndefined();
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result).toEqual(testCase.expected);
        }
      });
    });
  });
});
