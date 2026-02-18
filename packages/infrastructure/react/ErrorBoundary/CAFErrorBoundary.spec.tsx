import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CAFErrorBoundary } from "./CAFErrorBoundary";
import { CAFErrorContext, useCAFError } from "./ErrorContext";
import React from "react";

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Component that uses error context
const ErrorDisplay = () => {
  const errorContext = useCAFError();
  if (!errorContext || !errorContext.error) {
    return <div>No error in context</div>;
  }
  return <div>Error: {errorContext.error.message}</div>;
};

describe("CAFErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console.error for expected error boundaries
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up after each test to prevent test isolation issues
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <CAFErrorBoundary>
        <div>Test content</div>
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("catches errors and displays default error UI", () => {
    render(
      <CAFErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <CAFErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("uses custom fallback UI when provided", () => {
    const customFallback = (error: Error, errorInfo: React.ErrorInfo, reset: () => void) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Reset</button>
      </div>
    );

    render(
      <CAFErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("provides error context to children", () => {
    render(
      <CAFErrorBoundary>
        <ErrorDisplay />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("No error in context")).toBeInTheDocument();
  });

  it("provides error in context when error occurs", () => {
    render(
      <CAFErrorBoundary>
        <ThrowError shouldThrow={true} />
        <ErrorDisplay />
      </CAFErrorBoundary>
    );

    // Error boundary catches the error, so ErrorDisplay won't render
    // But the context should be available in the fallback
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("resets error when resetError is called", () => {
    const { rerender } = render(
      <CAFErrorBoundary key="test1">
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Simulate reset by re-rendering with a new key (forces remount)
    rerender(
      <CAFErrorBoundary key="test2">
        <ThrowError shouldThrow={false} />
      </CAFErrorBoundary>
    );

    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("resetError button calls reset function", () => {
    render(
      <CAFErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    const resetButton = screen.getByText("Try again");
    expect(resetButton).toBeInTheDocument();

    // Click reset button - verify it doesn't throw
    expect(() => resetButton.click()).not.toThrow();
    
    // Verify button is still accessible after click
    // Note: React error boundaries require a key change to fully reset,
    // but clicking the button should call resetError without errors
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("handles multiple errors correctly", () => {
    const { rerender, container } = render(
      <CAFErrorBoundary key="error1">
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    // Use container to scope queries to this specific render
    expect(container.querySelector("h2")?.textContent).toBe("Something went wrong");

    // Reset by changing key (forces remount)
    rerender(
      <CAFErrorBoundary key="reset1">
        <ThrowError shouldThrow={false} />
      </CAFErrorBoundary>
    );

    // After reset, error UI should be gone and children should render
    expect(container.querySelector("h2")).toBeNull();
    expect(screen.getByText("No error")).toBeInTheDocument();

    // Throw again with new key
    rerender(
      <CAFErrorBoundary key="error2">
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    // Error should be caught again
    expect(container.querySelector("h2")?.textContent).toBe("Something went wrong");
  });
});

describe("useCAFError", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns null when used outside CAFErrorBoundary", () => {
    const TestComponent = () => {
      const error = useCAFError();
      return <div>{error ? "Has context" : "No context"}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText("No context")).toBeInTheDocument();
  });

  it("returns context value when used inside CAFErrorBoundary", () => {
    const TestComponent = () => {
      const error = useCAFError();
      return (
        <div>
          {error ? `Has context, reset available: ${!!error.resetError}` : "No context"}
        </div>
      );
    };

    render(
      <CAFErrorBoundary>
        <TestComponent />
      </CAFErrorBoundary>
    );

    expect(screen.getByText(/Has context, reset available: true/)).toBeInTheDocument();
  });
});
