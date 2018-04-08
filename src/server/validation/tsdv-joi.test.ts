import { expect } from 'chai';
import { AnyConstraints, NumberConstraints, ObjectConstraints, StringConstraints, BooleanConstraints } from 'tsdv-joi';

import { validateAndTransform } from './tsdv-joi';
import { ObjectWithStringProps } from '../../server';

describe('server/validation/tsdv-joi', () => {
  describe('validateAndTransform', () => {
    describe('when validating input against a class with tsdv-joi decorators', () => {
      class Todo {
        @AnyConstraints.Optional()
        @NumberConstraints.Integer()
        id?: number;

        @AnyConstraints.Required()
        @StringConstraints.Min(1)
        title: string = '';

        @BooleanConstraints.BooleanSchema()
        isCompleted: boolean = false;
      }

      it('should return transformed result when input is valid', () => {
        const input: ObjectWithStringProps<Todo> = {
          id: '1',
          title: 'Walk the cats',
          isCompleted: 'true'
        };
        const result = validateAndTransform(input, Todo);
        expect(result).to.deep.equal({
          id: 1,
          title: 'Walk the cats',
          isCompleted: true
        });
      });

      it('should throw validation error when input is invalid', () => {
        const input: any = {
          title: ''
        };
        expect(() => validateAndTransform(input, Todo)).to.throw('child "title" fails because ["title" is not allowed to be empty]');
      });
    });

    describe('when validating input against a class without any tsdv-joi decorators', () => {
      class Todo {
        id?: number;
        title: string = '';
        isCompleted: boolean = false;
      }

      it('should throw validation error about unexpected fields', () => {
        const input: ObjectWithStringProps<Todo> = {
          id: '1',
          title: 'Walk the cats',
          isCompleted: 'true'
        };
        expect(() => validateAndTransform(input, Todo)).to.throw('"id" is not allowed. "title" is not allowed. "isCompleted" is not allowed');
      });
    });

    describe('when validating input without a class', () => {
      it('should return the input as is', () => {
        const input = {
          id: '1',
          title: 'Walk the cats',
          isCompleted: 'true'
        };
        const result = validateAndTransform(input);
        expect(result).to.deep.equal({
          id: '1',
          title: 'Walk the cats',
          isCompleted: 'true'
        });
      });
    });
  });
});
