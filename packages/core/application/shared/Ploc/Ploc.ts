type Subscription<S> = (state: S) => void;

export abstract class Ploc<S> {
  private internalState: S;
  private listeners: Set<Subscription<S>> = new Set();

  constructor(internalState: S) {
    this.internalState = internalState;
  }

  public get state(): S {
    return this.internalState;
  }

  changeState(state: S) {
    this.internalState = state;

    if (this.listeners.size > 0) {
      this.listeners.forEach(listener => listener(this.state));
    }
  }

  subscribe(listener: Subscription<S>) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: Subscription<S>) {
    const hasListeners = this.listeners.has(listener)
    if (hasListeners) {
      this.listeners.delete(listener);
    }
  }
}
