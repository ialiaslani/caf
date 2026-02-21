import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import { Ploc } from "@c-a-f/core";
import { useCAFContext } from "./CAFContext";
import { CAFProvider } from "./CAFProvider";

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

const fakeUseCase = {
  execute: async () => ({ loading: { value: false }, data: { value: null }, error: { value: null } }),
};

describe("useCAFContext", () => {
  it("returns default empty plocs and useCases when used outside CAFProvider", () => {
    const { result } = renderHook(() => useCAFContext());

    expect(result.current.plocs).toEqual({});
    expect(result.current.useCases).toEqual({});
  });

  it("returns provided plocs and useCases when used inside CAFProvider", () => {
    const ploc = new CounterPloc(42);

    const Consumer = () => {
      const { plocs, useCases } = useCAFContext();
      return (
        <div>
          <span data-testid="ploc-count">{Object.keys(plocs).length}</span>
          <span data-testid="ploc-user">{plocs["user"] === ploc ? "same" : "different"}</span>
          <span data-testid="uc-count">{Object.keys(useCases).length}</span>
          <span data-testid="uc-create">{useCases["createUser"] === fakeUseCase ? "same" : "different"}</span>
        </div>
      );
    };

    render(
      <CAFProvider plocs={{ user: ploc }} useCases={{ createUser: fakeUseCase }}>
        <Consumer />
      </CAFProvider>
    );

    expect(screen.getByTestId("ploc-count")).toHaveTextContent("1");
    expect(screen.getByTestId("ploc-user")).toHaveTextContent("same");
    expect(screen.getByTestId("uc-count")).toHaveTextContent("1");
    expect(screen.getByTestId("uc-create")).toHaveTextContent("same");
  });
});

describe("CAFProvider", () => {
  it("renders children", () => {
    render(
      <CAFProvider>
        <div>Child content</div>
      </CAFProvider>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("provides empty registries when plocs and useCases are omitted", () => {
    const Consumer = () => {
      const { plocs, useCases } = useCAFContext();
      return (
        <span data-testid="empty">
          {Object.keys(plocs).length}-{Object.keys(useCases).length}
        </span>
      );
    };

    render(
      <CAFProvider>
        <Consumer />
      </CAFProvider>
    );

    expect(screen.getByTestId("empty")).toHaveTextContent("0-0");
  });

  it("provides a copy of plocs/useCases so parent mutation does not affect context", () => {
    const ploc = new CounterPloc(1);
    const plocsRef: Record<string, Ploc<unknown>> = { counter: ploc };

    const Consumer = () => {
      const { plocs } = useCAFContext();
      return <span data-testid="keys">{Object.keys(plocs).join(",")}</span>;
    };

    const { rerender } = render(
      <CAFProvider plocs={plocsRef}>
        <Consumer />
      </CAFProvider>
    );

    expect(screen.getByTestId("keys")).toHaveTextContent("counter");

    plocsRef.extra = new CounterPloc(2);
    rerender(
      <CAFProvider plocs={plocsRef}>
        <Consumer />
      </CAFProvider>
    );

    expect(screen.getByTestId("keys")).toHaveTextContent("counter,extra");
  });

  it("inner provider does not merge with outer; descendant sees only inner value", () => {
    const outerPloc = new CounterPloc(10);
    const innerPloc = new CounterPloc(20);

    const Consumer = () => {
      const { plocs } = useCAFContext();
      const keys = Object.keys(plocs).sort().join(",");
      const userVal = plocs["user"] ? (plocs["user"] as CounterPloc).state : "missing";
      const dashboardVal = plocs["dashboard"] ? (plocs["dashboard"] as CounterPloc).state : "missing";
      return (
        <span data-testid="result">
          {keys} | user={userVal} dashboard={dashboardVal}
        </span>
      );
    };

    render(
      <CAFProvider plocs={{ user: outerPloc }}>
        <CAFProvider plocs={{ dashboard: innerPloc }}>
          <Consumer />
        </CAFProvider>
      </CAFProvider>
    );

    expect(screen.getByTestId("result")).toHaveTextContent(
      "dashboard | user=missing dashboard=20"
    );
  });
});
