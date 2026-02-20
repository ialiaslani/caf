import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import App from '../App.vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'UserManagement', component: { template: '<div>User Management</div>' } },
    { path: '/patterns', name: 'Patterns', component: { template: '<div>Patterns</div>' } },
  ],
});

describe('App', () => {
  it('mounts and renders navigation', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });
    await router.isReady();
    expect(wrapper.text()).toContain('User Management');
    expect(wrapper.text()).toContain('Patterns');
  });
});
