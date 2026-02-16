type Listener<T> = (value: T) => void;

/**
 * Single reactive value: holds a value and notifies subscribers when it changes.
 * Use Pulse for one reactive cell (e.g. loading flag, current user); use Ploc
 * for a stateful bloc with structured state and logic (e.g. a screen or feature).
 */
class Pulse<T> {
  private _value: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
    return this.createProxy(this);
  }

  private createProxy(target: any): any {
    return new Proxy(target, {
      get: (target, prop) => {
        if (prop === 'value') {
          return this._value;
        }
        return Reflect.get(target, prop);
      },
      set: (target, prop, value) => {
        if (prop === 'value') {
          if (this._value !== value) {
            this._value = value;
            this.notifyListeners();
          }
          return true;
        }
        return Reflect.set(target, prop, value);
      }
    });
  }

  subscribe(listener: Listener<T>): void {
    this.listeners.add(listener);
  }

  unsubscribe(listener: Listener<T>): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this._value));
  }
}

const pulse = <T>(v: T) => (new Pulse<T>(v)) as (Pulse<T> & { value: T });

export { Pulse, pulse };
