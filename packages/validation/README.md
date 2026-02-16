# @caf/validation

Schema-agnostic validation interfaces and runner for CAF. Works with Zod, Yup, or any validation library.

## Installation

```bash
npm install @caf/validation
```

For Zod integration:
```bash
npm install @caf/validation zod
```

For Yup integration:
```bash
npm install @caf/validation yup
```

## Usage

### Core Interfaces

The package provides schema-agnostic interfaces that work with any validation library:

```typescript
import { IValidator, ValidationResult, ValidationError } from '@caf/validation';

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
import { ValidationRunner, IValidator } from '@caf/validation';

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
import { ZodValidator } from '@caf/validation/zod';
import { ValidationRunner } from '@caf/validation';

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
import { YupValidator } from '@caf/validation/yup';
import { ValidationRunner } from '@caf/validation';

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

## Custom Validator Implementation

You can implement `IValidator` for any validation library:

```typescript
import { IValidator, ValidationResult, ValidationError } from '@caf/validation';

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
- `ZodValidator` — Adapter for Zod schemas (from `@caf/validation/zod`)
- `YupValidator` — Adapter for Yup schemas (from `@caf/validation/yup`)

## Dependencies

- `@caf/core` — Core primitives

## Peer Dependencies (Optional)

- `zod` — For Zod integration
- `yup` — For Yup integration

## License

MIT
