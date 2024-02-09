/* eslint-disable max-classes-per-file */
import 'reflect-metadata';

import * as jf from 'joiful';
import { ValidateAndTransformFunction } from '@typepoint/server';
import { arrayOf, Empty, Constructor } from '@typepoint/shared';
import { getValidateAndTransformFunction } from '.';

describe('index', () => {
  let validateAndTransform: ValidateAndTransformFunction;

  beforeEach(() => {
    validateAndTransform = getValidateAndTransformFunction();
  });

  describe('getValidateAndTransformFunction', () => {
    it('should allow passing a custom joi validator', () => {
      class Todo {
        @jf.number().integer().optional()
          id?: number;

        @jf.string().min(1).required()
          title = '';

        @jf.boolean().required()
          isCompleted = false;
      }

      const todo = {
        id: '1',
        title: 'Do the dishes',
        isCompleted: false,
        extraProperty: 'foo',
      };

      let result = validateAndTransform(todo, Todo);
      expect(result).toHaveProperty(
        ['validationError', 'message'],
        '"extraProperty" is not allowed',
      );

      const validator = new jf.Validator({
        allowUnknown: true,
      });

      validateAndTransform = getValidateAndTransformFunction({
        validator,
      });

      result = validateAndTransform(todo, Todo);
      expect(result).not.toHaveProperty(
        ['validationError', 'message'],
        '"extraProperty" is not allowed',
      );
    });

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
          '"title" is not allowed to be empty',
        );
      });
    });
  });

  describe('when validating input against a class without any joiful decorators', () => {
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
      expect(() => validateAndTransform(input, Todo)).toThrow(
        'No validation schema was found for class Todo. Did you forget to decorate the class?',
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

  describe('when validating input against an array of class', () => {
    class Todo {
      @jf.number().integer().optional()
        id?: number;

      @jf.string().min(1).required()
        title = '';

      @jf.boolean().required()
        isCompleted = false;
    }

    it('should return transformed result when input is valid', () => {
      const input = [{
        id: '1',
        title: 'Walk the cats',
        isCompleted: 'true',
      }];
      const result = validateAndTransform(input, arrayOf(Todo));
      expect(result).toEqual({
        value: [{
          id: 1,
          title: 'Walk the cats',
          isCompleted: true,
        }],
      });
    });

    it('should return validation error when input is invalid', () => {
      const input: any = [{
        title: '',
      }];
      expect(validateAndTransform(input, arrayOf(Todo))).toHaveProperty(
        ['validationError', 'message'],
        '"[0].title" is not allowed to be empty',
      );
    });

    it('should return as is when ArrayOf descriptor does not include an element class', () => {
      const input = [{
        title: 'Walk the cats',
        foo: 'bar',
      }];
      expect(validateAndTransform(input, arrayOf(null as any as Constructor<any>)))
        .toEqual({
          value: [{
            title: 'Walk the cats',
            foo: 'bar',
          }],
        });
    });
  });

  describe('when validating input that is expected to be Empty', () => {
    it('should return result as is, if it is Empty', () => {
      expect(validateAndTransform(null, Empty)).toEqual({ value: null });
      expect(validateAndTransform(undefined, Empty)).toEqual({ value: undefined });
      expect(validateAndTransform({}, Empty)).toEqual({ value: {} });
    });

    it('should return validation error when input is not Empty', () => {
      const input: any = [{
        title: 'Foo',
      }];
      expect(validateAndTransform(input, Empty)).toHaveProperty(
        ['validationError', 'message'],
        'Value is not empty',
      );
    });
  });
});
