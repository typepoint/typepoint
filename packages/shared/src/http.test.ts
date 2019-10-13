import { TestCase } from 'jest-helpers';
import { cleanseHttpMethod, HttpMethod } from './http';

describe('shared/http', () => {
  describe('cleanseHttpMethod', () => {
    it('should return method in uppercase', () => {
      type CleanseHttpMethodCaseTestCase = TestCase<any, HttpMethod>;
      const testCases: CleanseHttpMethodCaseTestCase[] = [
        { input: 'get', expected: 'GET' },
        { input: 'put', expected: 'PUT' },
        { input: 'post', expected: 'POST' },
        { input: 'patch', expected: 'PATCH' },
        { input: 'delete', expected: 'DELETE' },
      ];
      testCases.forEach((testCase) => {
        expect(cleanseHttpMethod(testCase.input)).toBe(testCase.expected);
      });
    });

    it('should error if method unsupported', () => {
      expect(() => cleanseHttpMethod('SQUANCH' as any)).toThrow('Unsupported HTTP method: SQUANCH');
    });
  });
});
