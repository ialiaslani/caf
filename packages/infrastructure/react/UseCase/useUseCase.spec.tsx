import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { UseCase, RequestResult, pulse } from "@c-a-f/core";
import { useUseCase } from "./useUseCase";

class MockUseCase implements UseCase<[string], string> {
  constructor(
    private implementation: (arg: string) => Promise<RequestResult<string>>
  ) {}

  async execute(arg: string): Promise<RequestResult<string>> {
    return await this.implementation(arg);
  }
}

describe("useUseCase", () => {
  it("returns initial state with loading false, error null, data null", () => {
    const useCase = new MockUseCase(async () => ({
      loading: pulse(false),
      data: pulse(null! as string),
      error: pulse(null! as Error),
    }));

    const { result } = renderHook(() => useUseCase(useCase));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
    expect(typeof result.current.execute).toBe("function");
  });

  it("updates state when execute is called and RequestResult changes", async () => {
    const loadingPulse = pulse(false);
    const dataPulse = pulse(null! as string);
    const errorPulse = pulse(null! as Error);

    const useCase = new MockUseCase(async () => ({
      loading: loadingPulse,
      data: dataPulse,
      error: errorPulse,
    }));

    const { result } = renderHook(() => useUseCase(useCase));

    // Initially false
    expect(result.current.loading).toBe(false);

    // Execute first to set up subscriptions
    await act(async () => {
      await result.current.execute("test");
    });

    // Now set loading to true - hook should react
    act(() => {
      loadingPulse.value = true;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Set data
    act(() => {
      dataPulse.value = "test result";
      loadingPulse.value = false;
    });

    await waitFor(() => {
      expect(result.current.data).toBe("test result");
      expect(result.current.loading).toBe(false);
    });
  });

  it("handles error state from RequestResult", async () => {
    const loadingPulse = pulse(false);
    const dataPulse = pulse(null! as string);
    const errorPulse = pulse(null! as Error);

    const useCase = new MockUseCase(async () => ({
      loading: loadingPulse,
      data: dataPulse,
      error: errorPulse,
    }));

    const { result } = renderHook(() => useUseCase(useCase));

    // Execute first to set up subscriptions
    await act(async () => {
      await result.current.execute("test");
    });

    const testError = new Error("Test error");

    act(() => {
      errorPulse.value = testError;
      loadingPulse.value = false;
    });

    await waitFor(() => {
      expect(result.current.error).toBe(testError);
      expect(result.current.loading).toBe(false);
    });
  });

  it("executes use case and returns data", async () => {
    const useCase = new MockUseCase(async (arg: string) => {
      return {
        loading: pulse(false),
        data: pulse(`result: ${arg}`),
        error: pulse(null! as Error),
      };
    });

    const { result } = renderHook(() => useUseCase(useCase));

    let executeResult: string | null = null;

    await act(async () => {
      executeResult = await result.current.execute("test");
    });

    await waitFor(() => {
      expect(result.current.data).toBe("result: test");
      expect(executeResult).toBe("result: test");
    });
  });

  it("handles exceptions during execution", async () => {
    const useCase = new MockUseCase(async () => {
      throw new Error("Execution failed");
    });

    const { result } = renderHook(() => useUseCase(useCase));

    let executeResult: string | null = null;

    await act(async () => {
      executeResult = await result.current.execute("test");
    });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Execution failed");
      expect(result.current.loading).toBe(false);
      expect(executeResult).toBeNull();
    });
  });

  it("unsubscribes from RequestResult on unmount", async () => {
    const loadingPulse = pulse(false);
    const dataPulse = pulse(null! as string);
    const errorPulse = pulse(null! as Error);

    const loadingUnsubscribe = vi.fn();
    const dataUnsubscribe = vi.fn();
    const errorUnsubscribe = vi.fn();

    loadingPulse.unsubscribe = vi.fn((listener) => {
      loadingUnsubscribe(listener);
    });
    dataPulse.unsubscribe = vi.fn((listener) => {
      dataUnsubscribe(listener);
    });
    errorPulse.unsubscribe = vi.fn((listener) => {
      errorUnsubscribe(listener);
    });

    const useCase = new MockUseCase(async () => ({
      loading: loadingPulse,
      data: dataPulse,
      error: errorPulse,
    }));

    const { result, unmount } = renderHook(() => useUseCase(useCase));

    // Execute to create subscriptions - must await to ensure subscriptions are set up
    await act(async () => {
      await result.current.execute("test");
    });

    unmount();

    // Verify unsubscribe was called for each pulse
    expect(loadingPulse.unsubscribe).toHaveBeenCalled();
    expect(dataPulse.unsubscribe).toHaveBeenCalled();
    expect(errorPulse.unsubscribe).toHaveBeenCalled();
  });

  it("unsubscribes from previous RequestResult when execute is called again", async () => {
    const firstLoadingPulse = pulse(false);
    const firstDataPulse = pulse(null! as string);
    const firstErrorPulse = pulse(null! as Error);

    const secondLoadingPulse = pulse(false);
    const secondDataPulse = pulse(null! as string);
    const secondErrorPulse = pulse(null! as Error);

    let callCount = 0;
    const useCase = new MockUseCase(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          loading: firstLoadingPulse,
          data: firstDataPulse,
          error: firstErrorPulse,
        };
      } else {
        return {
          loading: secondLoadingPulse,
          data: secondDataPulse,
          error: secondErrorPulse,
        };
      }
    });

    const firstUnsubscribe = vi.fn();
    firstLoadingPulse.unsubscribe = vi.fn((listener) => {
      firstUnsubscribe(listener);
    });

    const { result } = renderHook(() => useUseCase(useCase));

    // First execution
    await act(async () => {
      await result.current.execute("first");
    });

    // Second execution should unsubscribe from first
    await act(async () => {
      await result.current.execute("second");
    });

    await waitFor(() => {
      expect(firstLoadingPulse.unsubscribe).toHaveBeenCalled();
    });
  });
});
