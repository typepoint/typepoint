import {
  Validator,
  ValidationResult,
} from 'joiful';
import {
  ValidateAndTransformFunction,
  ValidateAndTransformFunctionResult,
} from '@typepoint/server';
import {
  Constructor,
  isArrayOf,
  isEmptyClass,
  isEmptyValue,
} from '@typepoint/shared';
import { ArrayOf } from '../../shared/src/index';

export const getValidateAndTransformFunction = (options?: { validator?: Validator }) => {
  const validator = (options && options.validator) || new Validator();

  const validateAndTransform: ValidateAndTransformFunction = <T extends {}>(
    input: T,
    Class?: Constructor<T> | (T extends Array<infer TElement> ? Constructor<ArrayOf<TElement>> : never),
  ): ValidateAndTransformFunctionResult => {
    if (Class) {
      const checkValidationResult = (
        validationResult: ValidationResult<any>,
      ): ValidateAndTransformFunctionResult => {
        if (validationResult.error) {
          return {
            validationError: validationResult.error,
          };
        }
        return {
          value: validationResult.value,
        };
      };

      if (isEmptyClass(Class)) {
        if (!isEmptyValue(input)) {
          return {
            validationError: {
              message: 'Value is not empty',
            },
          };
        }
      } else if (isArrayOf(Class)) {
        const arrayOfInstance: ArrayOf<any> = new Class();
        const ElementClass = arrayOfInstance.classInfo && arrayOfInstance.classInfo.element;
        if (ElementClass) {
          const elementValidationResult = validator.validateArrayAsClass(input as unknown as any[], ElementClass);
          return checkValidationResult(elementValidationResult);
        }
      } else {
        const validationResult = validator.validateAsClass(input, Class);
        return checkValidationResult(validationResult);
      }
    }

    return {
      value: input as any as T,
    };
  };

  return validateAndTransform;
};
