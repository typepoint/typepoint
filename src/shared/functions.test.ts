import { argumentsToArray } from './functions';

describe('shared/functions', () => {
  describe('argumentsToArray', () => {
    it('should accept an arguments object and return it as an array', () => {
      function wrapper(...args: any[]) {
        return argumentsToArray(arguments);
      }

      const actual = wrapper('hello', 'world');

      expect(actual).toBeInstanceOf(Array);
      expect(actual).toHaveLength(2);
    });
  });
});
