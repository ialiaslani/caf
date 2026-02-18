// Setup file for vitest to support class-validator decorators
// Must be imported before any decorators are processed
import 'reflect-metadata';

// Ensure reflect-metadata is properly initialized
if (typeof Reflect !== 'undefined' && !Reflect.getMetadata) {
  // Fallback if reflect-metadata didn't load properly
  console.warn('reflect-metadata may not be loaded correctly');
}
