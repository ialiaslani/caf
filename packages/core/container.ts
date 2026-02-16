/**
 * Simple dependency injection container
 */
class Container {
  private services = new Map<string | symbol, any>();

  bind<T>(key: string | symbol, factory: () => T): void {
    this.services.set(key, factory);
  }

  get<T>(key: string | symbol): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service not found for key: ${String(key)}`);
    }
    return factory();
  }

  singleton<T>(key: string | symbol, factory: () => T): void {
    let instance: T | null = null;
    this.services.set(key, () => {
      if (!instance) {
        instance = factory();
      }
      return instance;
    });
  }
}

export const container = new Container();
