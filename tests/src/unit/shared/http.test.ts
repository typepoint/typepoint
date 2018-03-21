import { expect } from 'chai';

import { cleanseHttpMethod, HttpMethod } from '../../../../shared/http';
import { TestCase } from '../../../infrastructure/testCase';

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
      for (const testCase of testCases) {
        expect(cleanseHttpMethod(testCase.input)).to.equal(testCase.expected);
      }
    });

    it('should error if method unsupported', () => {
      expect(() => cleanseHttpMethod('SQUANCH' as any)).to.throw('Unsupported HTTP method: SQUANCH');
    });
  });
});
