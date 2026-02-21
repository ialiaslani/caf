---
title: "@c-a-f/validation"
sidebar_label: Validation
---

# @c-a-f/validation

Schema-agnostic validation interfaces and adapters for CAF. Works with Zod, Yup, Joi, class-validator, or any validation library.

## Installation

```bash
npm install @c-a-f/validation
```

For a schema library (optional peer):

```bash
npm install zod
# or yup | joi | class-validator
```

## Features

| Feature | Description |
|--------|-------------|
| **IValidator&lt;T&gt;** | Interface: `validate(data)`, `parse(data)`, `isValid(data)`. |
| **ValidationResult** | `{ success, errors?, data? }`. |
| **ValidationError** | `{ path, message }`. |
| **ValidationRunner** | `run(validator, data)`, `runAll([...])`, `runOrThrow(validator, data)`, `formatErrors(errors)`, `formatErrorsAsRecord(errors)`. |
| **ValidationErrorException** | Exception thrown on validation failure. |
| **ZodValidator** | Adapter for Zod schemas. (`@c-a-f/validation/zod`) |
| **YupValidator** | Adapter for Yup schemas. (`@c-a-f/validation/yup`) |
| **JoiValidator** | Adapter for Joi schemas. (`@c-a-f/validation/joi`) |
| **ClassValidatorAdapter / createClassValidator** | Adapter for class-validator. (`@c-a-f/validation/class-validator`) |

## Core interfaces

```typescript
import { IValidator, ValidationResult, ValidationError, ValidationRunner } from '@c-a-f/validation';

const result = await ValidationRunner.run(validator, data);
const results = await ValidationRunner.runAll([
  { validator: emailValidator, data: email },
  { validator: passwordValidator, data: password },
]);
const validatedData = await ValidationRunner.runOrThrow(validator, data);

const errorMessages = ValidationRunner.formatErrors(result.errors);
const errorRecord = ValidationRunner.formatErrorsAsRecord(result.errors);
```

## Zod

```typescript
import { z } from 'zod';
import { ZodValidator } from '@c-a-f/validation/zod';
import { ValidationRunner } from '@c-a-f/validation';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
  name: z.string().min(1),
});

const validator = new ZodValidator(userSchema);
const result = await validator.validate({ email: 'user@example.com', age: 25, name: 'John' });

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', ValidationRunner.formatErrors(result.errors));
}

const validated = await validator.parse(data); // throws on error
```

## Yup

```typescript
import * as yup from 'yup';
import { YupValidator } from '@c-a-f/validation/yup';

const userSchema = yup.object({
  email: yup.string().email().required(),
  age: yup.number().min(18).required(),
  name: yup.string().min(1).required(),
});

const validator = new YupValidator(userSchema);
const result = await validator.validate(data);
```

## Joi

```typescript
import Joi from 'joi';
import { JoiValidator } from '@c-a-f/validation/joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  age: Joi.number().min(18).required(),
  name: Joi.string().min(1).required(),
});

const validator = new JoiValidator(userSchema);
const result = await validator.validate(data);
```

## class-validator

```typescript
import { validate, IsString, IsEmail, IsNumber, Min } from 'class-validator';
import { createClassValidator } from '@c-a-f/validation/class-validator';

class UserDto {
  @IsString() @IsEmail() email!: string;
  @IsNumber() @Min(18) age!: number;
  @IsString() name!: string;
}

const validator = createClassValidator(UserDto, validate);
const result = await validator.validate(data);
```

## Custom validator

Implement `IValidator<T>` for any validation library and use with `ValidationRunner`.

## Exports

- **Main:** IValidator, ValidationResult, ValidationError, ValidationRunner, ValidationErrorException  
- **/zod:** ZodValidator  
- **/yup:** YupValidator  
- **/joi:** JoiValidator  
- **/class-validator:** ClassValidatorAdapter, createClassValidator  

## Dependencies

- `@c-a-f/core` — Core primitives  
- **Peer (optional):** zod, yup, joi, class-validator  
