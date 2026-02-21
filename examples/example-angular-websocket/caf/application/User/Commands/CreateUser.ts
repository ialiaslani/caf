import type { UseCase, RequestResult } from '@c-a-f/core';
import { pulse } from '@c-a-f/core';
import type { IValidator } from '@c-a-f/validation';
import { ValidationRunner } from '@c-a-f/validation';
import type { User } from '../../../domain';
import type { CreateUserInput } from '../../../domain/User/user.validation';
import { UserService } from '../../../domain';

export class UserValidationError extends Error {
  constructor(
    message: string,
    public fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'UserValidationError';
  }
}

export class CreateUser implements UseCase<[CreateUserInput], User> {
  constructor(
    private validator: IValidator<CreateUserInput>,
    private userService: UserService
  ) {}

  async execute(user: CreateUserInput): Promise<RequestResult<User>> {
    try {
      const validationResult = await ValidationRunner.run(this.validator, user);
      if (!validationResult.success) {
        const fieldErrors = ValidationRunner.formatErrorsAsRecord(validationResult.errors);
        const formattedErrors = validationResult.errors.map(
          (err) => `${Array.isArray(err.path) ? err.path.join('.') : err.path}: ${err.message}`
        );
        const error = new UserValidationError(`Validation failed: ${formattedErrors.join('; ')}`);
        error.fieldErrors = fieldErrors;
        throw error;
      }
      const userToCreate: User = {
        ...(validationResult.data as CreateUserInput),
        id: '',
      };
      const createdUser = await this.userService.createUser(userToCreate);
      if (!createdUser?.id || !createdUser.name || !createdUser.email) {
        throw new Error('Invalid user data returned from service');
      }
      return {
        loading: pulse(false),
        data: pulse(createdUser),
        error: pulse(null! as Error),
      };
    } catch (error) {
      return {
        loading: pulse(false),
        data: pulse(null! as User),
        error: pulse(error as Error),
      };
    }
  }
}
