<script setup lang="ts">
/**
 * Minimal component for integration testing: displays users from Ploc and a Refresh button.
 * Uses usePlocFromContext + usePloc so tests can mount with CAFProvider and a test Ploc.
 */
import { usePlocFromContext } from '@c.a.f/infrastructure-vue';
import type { UserPloc } from '../../caf/application';
import UserListInner from './UserListInner.vue';

const ploc = usePlocFromContext<UserPloc>('user');
</script>

<template>
  <div v-if="!ploc" data-testid="no-ploc">No Ploc in context</div>
  <UserListInner v-else :ploc="ploc" />
</template>
