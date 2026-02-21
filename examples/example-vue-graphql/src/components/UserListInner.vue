<script setup lang="ts">
import { usePloc } from '@c-a-f/infrastructure-vue';
import type { UserPloc } from '../../caf/application';

const props = defineProps<{ ploc: UserPloc }>();
const [state] = usePloc(props.ploc);
</script>

<template>
  <div data-testid="user-list">
    <div data-testid="count">Count: {{ state.users.length }}</div>
    <div data-testid="loading">{{ state.loading ? 'Loading' : 'Idle' }}</div>
    <div v-if="state.error" data-testid="error">{{ state.error }}</div>
    <button
      type="button"
      data-testid="refresh"
      :disabled="state.loading"
      @click="props.ploc.loadUsers()"
    >
      Refresh
    </button>
    <ul data-testid="users">
      <li
        v-for="u in state.users"
        :key="u.id"
        :data-testid="`user-${u.id}`"
      >
        {{ u.name }} – {{ u.email }}
      </li>
    </ul>
  </div>
</template>
