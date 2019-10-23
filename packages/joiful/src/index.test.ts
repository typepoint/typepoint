import 'reflect-metadata';

import * as jf from 'joiful';
import { ValidateAndTransformFunction } from '@typepoint/server';
import { getValidateAndTransformFunction } from '.';

describe('index', () => {
  let validateAndTransform: ValidateAndTransformFunction;

  beforeEach(() => {
    validateAndTransform = getValidateAndTransformFunction();
  });

  describe('getValidateAndTransformFunction', () => {
    describe('when validating input against a class with joiful decorators', () => {
      class Todo {
        @jf.number().integer().optional()
        id?: number;

        @jf.string().min(1).required()
        title = '';

        @jf.boolean().required()
        isCompleted = false;
      }

      it('should return transformed result when input is valid', () => {
        const input = {
          id: '1',
          title: 'Walk the cats',
          isCompleted: 'true',
        };
        const result = validateAndTransform(input, Todo);
        expect(result).toEqual({
          value: {
            id: 1,
            title: 'Walk the cats',
            isCompleted: true,
          },
        });
      });

      it('should return validation error when input is invalid', () => {
        const input: any = {
          title: '',
        };
        expect(validateAndTransform(input, Todo)).toHaveProperty(
          ['validationError', 'message'],
          'child "title" fails because ["title" is not allowed to be empty]',
        );
      });
    });
  });

  describe('when validating input against a class without any tsdv-joi decorators', () => {
    class Todo {
      id?: number;

      title = '';

      isCompleted = false;
    }

    it('should return validation error about unexpected fields', () => {
      const input = {
        id: '1',
        title: 'Walk the cats',
        isCompleted: 'true',
      };
      expect(validateAndTransform(input, Todo)).toHaveProperty(
        ['validationError', 'message'],
        '"id" is not allowed. "title" is not allowed. "isCompleted" is not allowed',
      );
    });
  });

  describe('when validating input without a class', () => {
    it('should return the input as is', () => {
      const input = {
        id: '1',
        title: 'Walk the cats',
        isCompleted: 'true',
      };
      const result = validateAndTransform(input);
      expect(result).toEqual({
        value: {
          id: '1',
          title: 'Walk the cats',
          isCompleted: 'true',
        },
      });
    });
  });
});
