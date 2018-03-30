import { expect } from 'chai';

import { escapeRegExp } from './regexp';
import { TestCase } from '../../tests/infrastructure/testCase';

describe('shared/regexp', () => {
  describe('escapeRegExp', () => {
    it('should escape text with regex characters characters', () => {
      type EscapeRegExpTestCase = TestCase<string, string>;

      const testCases: EscapeRegExpTestCase[] = [
        {
          input: 'Hello world',
          expected: 'Hello world'
        },
        {
          input: '[(\\hello|world/)]',
          expected: '\\[\\(\\\\hello\\|world\\/\\)\\]'
        }
      ];

      for (const testCase of testCases) {
        const actual = escapeRegExp(testCase.input);
        expect(actual).to.equal(testCase.expected);
      }
    });
  });
});
