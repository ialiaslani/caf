import { describe, it, expect, vi } from "vitest";
import { UseCase, pulse } from "@c.a.f/core";
import { useUseCase } from "./useUseCase";
import { withSetup } from "../test-utils";

class MockUseCase implements UseCase<[string], string> {
  constructor(
    private implementation: (arg: string) => Promise<{ loading: ReturnType<typeof pulse>; data: ReturnType<typeof pulse>; error: ReturnType<typeof pulse> }>
  ) {}

  async execute(arg: string) {
    return this.implementation(arg);
  }
}

describe("useUseCase", () => {
  it("returns initial state with loading false, error null, data null", () => {
    const useCase = new MockUseCase(async () => ({
      loading: pulse(false),
      data: pulse(null! as string),
      error: pulse(null! as Error),
    }));

    const [result, unmount] = withSetup(() => useUseCase(useCase));
    expect(result.loading.value).toBe(false);
    expect(result.error.value).toBeNull();
    expect(result.data.value).toBeNull();
    expect(typeof result.execute).toBe("function");
    unmount();
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

    const [result, unmount] = withSetup(() => useUseCase(useCase));
    expect(result.loading.value).toBe(false);

    await result.execute("test");

    loadingPulse.value = true;
    expect(result.loading.value).toBe(true);

    dataPulse.value = "test result";
    loadingPulse.value = false;
    expect(result.data.value).toBe("test result");
    expect(result.loading.value).toBe(false);
    unmount();
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

    const [result, unmount] = withSetup(() => useUseCase(useCase));
    await result.execute("test");

    const testError = new Error("Test error");
    errorPulse.value = testError;
    loadingPulse.value = false;

    expect(result.error.value).toBe(testError);
    expect(result.loading.value).toBe(false);
    unmount();
  });

  it("executes use case and returns data", async () => {
    const useCase = new MockUseCase(async (arg: string) => ({
      loading: pulse(false),
      data: pulse(`result: ${arg}`),
      error: pulse(null! as Error),
    }));

    const [result, unmount] = withSetup(() => useUseCase(useCase));
    const executeResult = await result.execute("test");

    expect(result.data.value).toBe("result: test");
    expect(executeResult).toBe("result: test");
    unmount();
  });

  it("handles exceptions during execution", async () => {
    const useCase = new MockUseCase(async () => {
      throw new Error("Execution failed");
    });

    const [result, unmount] = withSetup(() => useUseCase(useCase));
    const executeResult = await result.execute("test");

    expect(result.error.value).toBeInstanceOf(Error);
    expect(result.error.value?.message).toBe("Execution failed");
    expect(result.loading.value).toBe(false);
    expect(executeResult).toBeNull();
    unmount();
  });

  it("unsubscribes from RequestResult on unmount", async () => {
    const loadingPulse = pulse(false);
    const dataPulse = pulse(null! as string);
    const errorPulse = pulse(null! as Error);

    loadingPulse.unsubscribe = vi.fn(loadingPulse.unsubscribe.bind(loadingPulse));
    dataPulse.unsubscribe = vi.fn(dataPulse.unsubscribe.bind(dataPulse));
    errorPulse.unsubscribe = vi.fn(errorPulse.unsubscribe.bind(errorPulse));

    const useCase = new MockUseCase(async () => ({
      loading: loadingPulse,
      data: dataPulse,
      error: errorPulse,
    }));

    const [result, unmount] = withSetup(() => useUseCase(useCase));
    await result.execute("test");
    unmount();

    expect(loadingPulse.unsubscribe).toHaveBeenCalled();
    expect(dataPulse.unsubscribe).toHaveBeenCalled();
    expect(errorPulse.unsubscribe).toHaveBeenCalled();
  });
});
