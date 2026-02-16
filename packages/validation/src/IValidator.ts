/**
 * Schema-agnostic validation interfaces.
 * 
 * These interfaces allow you to use any validation library (Zod, Yup, Joi, etc.)
 * with CAF by implementing the IValidator interface.
 */

/**
 * Validation error details.
 */
export interface ValidationError {
  /** Field path (e.g., "user.email" or "address.street") */
  path: string | string[];
  /** Error message */
  message: string;
  /** Error code (optional, library-specific) */
  code?: string;
}

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  success: boolean;
  /** Validation errors (empty if success is true) */
  errors: ValidationError[];
  /** Validated data (if success is true) */
  data?: unknown;
}

/**
 * Schema-agnostic validator interface.
 * 
 * Implement this interface to integrate any validation library with CAF.
 * The validator should be able to validate data against a schema.
 */
export interface IValidator<T = unknown> {
  /**
   * Validate data against the schema.
   * @param data Data to validate
   * @returns Validation result with success status and errors
   */
  validate(data: unknown): ValidationResult | Promise<ValidationResult>;
  
  /**
   * Parse and validate data, returning the validated data or throwing errors.
   * @param data Data to validate
   * @returns Validated data of type T
   * @throws If validation fails
   */
  parse(data: unknown): T | Promise<T>;
  
  /**
   * Check if data is valid without throwing.
   * @param data Data to check
   * @returns True if valid, false otherwise
   */
  isValid(data: unknown): boolean | Promise<boolean>;
}
