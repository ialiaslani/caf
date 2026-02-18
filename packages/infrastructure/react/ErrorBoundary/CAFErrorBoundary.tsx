import React, { Component, type ReactNode } from "react";
import { CAFErrorContext, type CAFErrorContextValue } from "./ErrorContext";

export interface CAFErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface CAFErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component for CAF applications.
 * Catches errors from Ploc/UseCase execution and component rendering.
 * Provides error context via React Context and supports custom error UI and recovery.
 *
 * @example
 * ```tsx
 * <CAFErrorBoundary fallback={(error, errorInfo, reset) => (
 *   <div>
 *     <h2>Something went wrong</h2>
 *     <p>{error.message}</p>
 *     <button onClick={reset}>Try again</button>
 *   </div>
 * )}>
 *   <App />
 * </CAFErrorBoundary>
 * ```
 */
export class CAFErrorBoundary extends Component<
  CAFErrorBoundaryProps,
  CAFErrorBoundaryState
> {
  constructor(props: CAFErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<CAFErrorBoundaryState> {
    return {
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.error) {
      const contextValue: CAFErrorContextValue = {
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        resetError: this.resetError,
      };

      // Use custom fallback if provided
      if (this.props.fallback) {
        return (
          <CAFErrorContext.Provider value={contextValue}>
            {this.props.fallback(
              this.state.error,
              this.state.errorInfo!,
              this.resetError
            )}
          </CAFErrorContext.Provider>
        );
      }

      // Default error UI
      return (
        <CAFErrorContext.Provider value={contextValue}>
          <div
            style={{
              padding: "2rem",
              margin: "1rem",
              border: "1px solid #ff6b6b",
              borderRadius: "8px",
              backgroundColor: "#fff5f5",
            }}
          >
            <h2 style={{ color: "#c92a2a", marginTop: 0 }}>
              Something went wrong
            </h2>
            <details style={{ marginBottom: "1rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Error details
              </summary>
              <pre
                style={{
                  marginTop: "0.5rem",
                  padding: "1rem",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "0.875rem",
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={this.resetError}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Try again
            </button>
          </div>
        </CAFErrorContext.Provider>
      );
    }

    return (
      <CAFErrorContext.Provider
        value={{
          error: null,
          errorInfo: null,
          resetError: this.resetError,
        }}
      >
        {this.props.children}
      </CAFErrorContext.Provider>
    );
  }
}
