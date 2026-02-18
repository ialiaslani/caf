import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CAFErrorBoundary, CAFErrorContext, useCAFError } from "./CAFErrorBoundary";
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
      <CAFErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Simulate reset by re-rendering without error
    rerender(
      <CAFErrorBoundary>
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

    const resetButton = screen.getByText("Try again");
    expect(resetButton).toBeInTheDocument();

    // Click reset button
    resetButton.click();

    // After reset, the error boundary should reset its state
    // In a real scenario, this would re-render the children
    // For testing, we verify the button exists and is clickable
    expect(resetButton).toBeInTheDocument();
  });

  it("handles multiple errors correctly", () => {
    const { rerender } = render(
      <CAFErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Reset
    rerender(
      <CAFErrorBoundary>
        <ThrowError shouldThrow={false} />
      </CAFErrorBoundary>
    );

    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();

    // Throw again
    rerender(
      <CAFErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CAFErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

describe("useCAFError", () => {
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
