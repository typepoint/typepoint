import { TestCase } from 'jest-helpers';
import { escapeRegExp } from './regexp';

describe('shared/regexp', () => {
  describe('escapeRegExp', () => {
    it('should escape text with regex characters characters', () => {
      type EscapeRegExpTestCase = TestCase<string, string>;

      const testCases: EscapeRegExpTestCase[] = [
        {
          input: 'Hello world',
          expected: 'Hello world',
        },
        {
          input: '[(\\hello|world/)]',
          expected: '\\[\\(\\\\hello\\|world\\/\\)\\]',
        },
      ];

      testCases.forEach((testCase) => {
        const actual = escapeRegExp(testCase.input);
        expect(actual).toBe(testCase.expected);
      });
    });
  });
});
