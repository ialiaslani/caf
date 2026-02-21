# @c-a-f/validation

Schema-agnostic validation interfaces and runner for CAF. Works with Zod, Yup, Joi, class-validator, or any validation library.

## Installation

```bash
npm install @c-a-f/validation
```

For Zod integration:
```bash
npm install @c-a-f/validation zod
```

For Yup integration:
```bash
npm install @c-a-f/validation yup
```

For Joi integration:
```bash
npm install @c-a-f/validation joi
```

For class-validator integration:
```bash
npm install @c-a-f/validation class-validator
```

## Usage

### Core Interfaces

The package provides schema-agnostic interfaces that work with any validation library:

```typescript
import { IValidator, ValidationResult, ValidationError } from '@c-a-f/validation';

// IValidator interface can be implemented by any validation library adapter
interface IValidator<T> {
  validate(data: unknown): ValidationResult | Promise<ValidationResult>;
  parse(data: unknown): T | Promise<T>;
  isValid(data: unknown): boolean | Promise<boolean>;
}
```

### Validation Runner

Use `ValidationRunner` to execute validations and format errors:

```typescript
import { ValidationRunner, IValidator } from '@c-a-f/validation';

// Run a single validation
const result = await ValidationRunner.run(validator, data);

// Run multiple validations and aggregate results
const results = await ValidationRunner.runAll([
  { validator: emailValidator, data: email },
  { validator: passwordValidator, data: password },
]);

// Run and throw on failure
const validatedData = await ValidationRunner.runOrThrow(validator, data);

// Format errors
const errorMessages = ValidationRunner.formatErrors(result.errors);
const errorRecord = ValidationRunner.formatErrorsAsRecord(result.errors);
```

## Integration with Zod

```typescript
import { z } from 'zod';
import { ZodValidator } from '@c-a-f/validation/zod';
import { ValidationRunner } from '@c-a-f/validation';

// Define Zod schema
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
  name: z.string().min(1),
});

// Create validator
const validator = new ZodValidator(userSchema);

// Validate data
const result = await validator.validate({
  email: 'user@example.com',
  age: 25,
  name: 'John',
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', ValidationRunner.formatErrors(result.errors));
}

// Or use parse to throw on error
try {
  const validated = await validator.parse(data);
  console.log('Validated:', validated);
} catch (error) {
  console.error('Validation failed:', error);
}
```

## Integration with Yup

```typescript
import * as yup from 'yup';
import { YupValidator } from '@c-a-f/validation/yup';
import { ValidationRunner } from '@c-a-f/validation';

// Define Yup schema
const userSchema = yup.object({
  email: yup.string().email().required(),
  age: yup.number().min(18).required(),
  name: yup.string().min(1).required(),
});

// Create validator
const validator = new YupValidator(userSchema);

// Validate data
const result = await validator.validate({
  email: 'user@example.com',
  age: 25,
  name: 'John',
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', ValidationRunner.formatErrors(result.errors));
}
```

## Integration with Joi

```typescript
import Joi from 'joi';
import { JoiValidator } from '@c-a-f/validation/joi';
import { ValidationRunner } from '@c-a-f/validation';

// Define Joi schema
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  age: Joi.number().min(18).required(),
  name: Joi.string().min(1).required(),
});

// Create validator
const validator = new JoiValidator(userSchema);

// Validate data
const result = await validator.validate({
  email: 'user@example.com',
  age: 25,
  name: 'John',
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', ValidationRunner.formatErrors(result.errors));
}

// Or use parse to throw on error
try {
  const validated = await validator.parse(data);
  console.log('Validated:', validated);
} catch (error) {
  console.error('Validation failed:', error);
}
```

## Integration with class-validator

```typescript
import { validate, IsString, IsEmail, IsNumber, Min } from 'class-validator';
import { ClassValidatorAdapter, createClassValidator } from '@c-a-f/validation/class-validator';
import { ValidationRunner } from '@c-a-f/validation';

// Define DTO class with decorators
class UserDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsNumber()
  @Min(18)
  age!: number;

  @IsString()
  name!: string;
}

// Create validator using factory function (recommended)
const validator = createClassValidator(UserDto, validate);

// Or create directly
// const validator = new ClassValidatorAdapter(UserDto, validate);

// Validate data
const result = await validator.validate({
  email: 'user@example.com',
  age: 25,
  name: 'John',
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', ValidationRunner.formatErrors(result.errors));
}

// Or use parse to throw on error
try {
  const validated = await validator.parse(data);
  console.log('Validated:', validated);
} catch (error) {
  console.error('Validation failed:', error);
}
```

## Custom Validator Implementation

You can implement `IValidator` for any validation library:

```typescript
import { IValidator, ValidationResult, ValidationError } from '@c-a-f/validation';

class CustomValidator<T> implements IValidator<T> {
  constructor(private validateFn: (data: unknown) => boolean) {}

  async validate(data: unknown): Promise<ValidationResult> {
    const isValid = this.validateFn(data);
    return {
      success: isValid,
      errors: isValid ? [] : [{ path: '', message: 'Validation failed' }],
      data: isValid ? (data as T) : undefined,
    };
  }

  async parse(data: unknown): Promise<T> {
    const result = await this.validate(data);
    if (!result.success) {
      throw new Error('Validation failed');
    }
    return result.data as T;
  }

  async isValid(data: unknown): Promise<boolean> {
    return this.validateFn(data);
  }
}
```

## Exports

- `IValidator` — Interface for validation implementations
- `ValidationResult` — Result type with success status and errors
- `ValidationError` — Error type with path and message
- `ValidationRunner` — Utility class for running validations
- `ValidationErrorException` — Exception thrown on validation failure
- `ZodValidator` — Adapter for Zod schemas (from `@c-a-f/validation/zod`)
- `YupValidator` — Adapter for Yup schemas (from `@c-a-f/validation/yup`)
- `JoiValidator` — Adapter for Joi schemas (from `@c-a-f/validation/joi`)
- `ClassValidatorAdapter` — Adapter for class-validator (from `@c-a-f/validation/class-validator`)
- `createClassValidator` — Factory function for creating class-validator adapters

## Dependencies

- `@c-a-f/core` — Core primitives

## Peer Dependencies (Optional)

- `zod` — For Zod integration
- `yup` — For Yup integration
- `joi` — For Joi integration
- `class-validator` — For class-validator integration

## Development

### Testing

The validation package includes comprehensive test coverage for all adapters and the validation runner. Tests use the actual validation libraries (Zod, Yup, Joi, class-validator) to ensure proper integration.

```bash
# Run tests
yarn workspace @c-a-f/validation test

# Run tests in watch mode
yarn workspace @c-a-f/validation test:watch
```

Or from the root directory:

```bash
# Run all tests (including validation)
yarn test

# Run only validation tests
yarn workspace @c-a-f/validation test
```

### Test Coverage

The test suite covers:
- **ValidationRunner** — All methods (run, runAll, runOrThrow, formatErrors, formatErrorsAsRecord)
- **ZodAdapter** — Validation, parsing, error handling, nested objects, arrays, transformations
- **YupAdapter** — Validation, parsing, error handling, nested objects, arrays, constraints
- **JoiAdapter** — Validation, parsing, error handling, error codes, transformations
- **ClassValidatorAdapter** — Validation, parsing, multiple constraints, optional fields, arrays

## License

MIT
