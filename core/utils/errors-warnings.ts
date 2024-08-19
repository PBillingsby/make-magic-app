import chalk from 'chalk';

/**
 * Enum of possible error codes associated
 * with `CreateMagicAppError` instances.
 */
export enum CreateMagicAppErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  USER_CANCELED_PROMPT = 'USER_CANCELED_PROMPT',
}

/**
 * Base class representing `make-magic-app` errors.
 */
export class CreateMagicAppError<Code extends CreateMagicAppErrorCode = CreateMagicAppErrorCode> extends Error {
  constructor(
    public readonly code: Code,
    message?: string,
  ) {
    super(chalk`{red Error:} ${message}`);
  }
}

/**
 * Prints a prefixed warning to the console.
 */
export function printWarning(message?: string) {
  console.warn(chalk`{yellow Warning:} ${message}`);
}

/**
 * Creates a validation error
 */
export function createValidationError(message?: string) {
  return new CreateMagicAppError(CreateMagicAppErrorCode.VALIDATION_ERROR, message);
}

export function createUserCanceledPromptError(message?: string) {
  return new CreateMagicAppError(CreateMagicAppErrorCode.USER_CANCELED_PROMPT, message);
}
