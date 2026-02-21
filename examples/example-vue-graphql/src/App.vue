<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import { useCAFDevTools } from '@c-a-f/infrastructure-vue';
import { createMemoryLeakDetector, createPerformanceProfiler } from '@c-a-f/devtools/core';
import { DevToolsLogger, LogLevel } from '@c-a-f/devtools/logger';
import { StateInspector } from '@c-a-f/devtools/inspector';
import Navigation from './components/Navigation.vue';

const isDev = import.meta.env.DEV;
const devTools = useCAFDevTools({ enabled: isDev });

// Enhanced DevTools (logger, memory leak detector, profiler, state inspector)
let leakDetector: ReturnType<typeof createMemoryLeakDetector> | null = null;
let profiler: ReturnType<typeof createPerformanceProfiler> | null = null;

onMounted(() => {
  if (!isDev) return;

  const logger = new DevToolsLogger({
    level: LogLevel.DEBUG,
    enabled: true,
    includeTimestamp: true,
    includeLevel: true,
  });

  leakDetector = createMemoryLeakDetector({
    enabled: true,
    warnThreshold: 10000,
    errorThreshold: 60000,
    checkInterval: 5000,
  });

  profiler = createPerformanceProfiler({
    enabled: true,
    trackSlowOperations: true,
    slowThreshold: 100,
  });

  const inspector = new StateInspector();

  (window as unknown as { __CAF_DEVTOOLS_ENHANCED__?: object }).__CAF_DEVTOOLS_ENHANCED__ = {
    logger,
    leakDetector,
    profiler,
    inspector,
  };

  logger.info('CAF Enhanced DevTools initialized', {
    logger: 'enabled',
    leakDetector: 'enabled',
    profiler: 'enabled',
    inspector: 'enabled',
  });
});

onUnmounted(() => {
  leakDetector?.cleanup();
  profiler?.clear();
});
</script>

<template>
  <div class="app-root">
    <Navigation />
    <main class="main">
      <RouterView />
    </main>
    <div v-if="isDev" class="devtools-toggle">
      <span>CAF DevTools:</span>
      <button
        type="button"
        class="devtools-btn"
        :class="{ on: devTools.enabled.value }"
        @click="devTools.enabled.value ? devTools.disable() : devTools.enable()"
      >
        {{ devTools.enabled.value ? 'ON' : 'OFF' }}
      </button>
    </div>
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}
.main {
  padding-top: 70px;
  padding-bottom: 2rem;
}
.devtools-toggle {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.devtools-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  background: #666;
}
.devtools-btn.on {
  background: #4caf50;
}
</style>
