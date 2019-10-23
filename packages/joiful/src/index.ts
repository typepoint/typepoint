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
} from '@typepoint/shared';

export const getValidateAndTransformFunction = (options?: { validator?: Validator }) => {
  const validator = (options && options.validator) || new Validator();

  const validateAndTransform: ValidateAndTransformFunction = <T extends {}>(
    input: T,
    Class?: Constructor<T>,
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
      value: input as any as T,
    };
  };

  return validateAndTransform;
};
