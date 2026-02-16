import { pulse, type Pulse } from "../../../domain/shared/Pulse";

type Subscription<S> = (state: S) => void;

/**
 * Presentation Logic Component: stateful bloc with structured state.
 * Built on top of Pulse (one reactive primitive). Use Ploc when you have
 * a stateful object (e.g. a screen or feature) with structured state and
 * logic; use Pulse for a single reactive value.
 */
export abstract class Ploc<S> {
  private readonly statePulse: Pulse<S> & { value: S };

  constructor(initialState: S) {
    this.statePulse = pulse(initialState);
  }

  public get state(): S {
    return this.statePulse.value;
  }

  changeState(state: S): void {
    this.statePulse.value = state;
  }

  subscribe(listener: Subscription<S>): void {
    this.statePulse.subscribe(listener);
  }

  unsubscribe(listener: Subscription<S>): void {
    this.statePulse.unsubscribe(listener);
  }
}
