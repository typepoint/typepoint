// TODO: Move this into separate package? e.g. @typepoint/tsdv-joi

import * as joi from 'tsdv-joi';

import { ValidationResult } from 'tsdv-joi/ValidationResult';
import { ObjectWithStringProps, ValidateAndTransformFunction, ValidateAndTransformFunctionResult } from '../../server';
import { Constructor, isArrayOf } from '../../shared';

export const validateAndTransform: ValidateAndTransformFunction =
  // tslint:disable-next-line:ban-types
  <T extends Object>(
    input: ObjectWithStringProps<T>,
    Class?: Constructor<T>
  ): ValidateAndTransformFunctionResult<T> => {
    if (Class) {
      const validator = new joi.Validator();

      const checkValidationResult = (
        validationResult: ValidationResult<any>
      ): ValidateAndTransformFunctionResult<T> => {
        if (validationResult.error) {
          return {
            validationError: validationResult.error
          };
        }
        return {
          value: validationResult.value
        };
      };

      if (isArrayOf(Class)) {
        const arrayOfInstance = new Class();
        const ElementClass = arrayOfInstance.classInfo && arrayOfInstance.classInfo.element;
        if (ElementClass) {
          const elementValidationResult = validator.validateAsClass(input, ElementClass);
          return checkValidationResult(elementValidationResult);
        }
      } else {
        const validationResult = validator.validateAsClass(input, Class);
        return checkValidationResult(validationResult);
      }
    }

    return {
      value: input as any as T
    };
  };
