<script setup lang="ts">
import { useRouteManager } from '@c-a-f/infrastructure-vue';
import { useRoute } from 'vue-router';

const routeManager = useRouteManager();
const route = useRoute();

function handleNavigate(path: string) {
  routeManager.changeRoute(path);
}
</script>

<template>
  <nav class="nav">
    <button
      type="button"
      class="nav-btn"
      :class="{ primary: route.path === '/' }"
      @click="handleNavigate('/')"
    >
      User Management
    </button>
    <button
      type="button"
      class="nav-btn"
      :class="{ primary: route.path === '/patterns' }"
      @click="handleNavigate('/patterns')"
    >
      Patterns
    </button>
    <div class="nav-current">
      <span>Current Route:</span>
      <code>{{ route.path }}</code>
    </div>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.nav-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  cursor: pointer;
  font-size: 0.95rem;
}
.nav-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-weight: 600;
}
.nav-current {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}
.nav-current code {
  padding: 0.25rem 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
}
</style>
