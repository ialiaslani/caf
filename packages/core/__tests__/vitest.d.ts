declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export const expect: {
    (value: unknown): {
      toBe(expected: unknown): void;
      toBeNull(): void;
      toBeDefined(): void;
      not: {
        toBe(expected: unknown): void;
        toHaveBeenCalled(): void;
        toBeNull(): void;
      };
      toHaveBeenCalled(): void;
      toHaveBeenCalledWith(...args: unknown[]): void;
    };
  };
  export const vi: {
    fn: <T extends (...args: unknown[]) => unknown>(impl?: T) => T & { mockResolvedValue(value: unknown): void; mockImplementation(fn: unknown): void };
    spyOn(obj: object, method: string): { mockImplementation(fn: () => void): void };
  };
  export function beforeEach(fn: () => void | Promise<void>): void;
}
