<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import {
  usePloc,
  usePlocFromContext,
  useUseCaseFromContext,
  useUseCase,
  useCAFError,
  useTrackPloc,
} from '@c.a.f/infrastructure-vue';
import { pulse } from '@c.a.f/core';
import type { UserPloc } from '../../caf/application';
import type { User } from '../../caf/domain';
import type { CreateUserInput } from '../../caf/domain/User/user.validation';
import { setupUserPloc } from '../../caf/setup';

const errorContext = useCAFError();
const userPloc = usePlocFromContext<UserPloc>('user');
const createUserUseCase = useUseCaseFromContext<[CreateUserInput], User>('createUser');

const fallbackPloc = setupUserPloc();
const effectivePloc = userPloc ?? fallbackPloc;
const [state, plocInstance] = usePloc(effectivePloc);
useTrackPloc(plocInstance, 'UserPloc');

const fallbackCreateUserUseCase = {
  async execute() {
    return {
      loading: pulse(false),
      data: pulse(null! as User),
      error: pulse(new Error('CreateUser not available')),
    };
  },
};
const useCaseResult = useUseCase(createUserUseCase ?? fallbackCreateUserUseCase);

const newName = ref('');
const newEmail = ref('');

onMounted(() => {
  if (plocInstance) plocInstance.loadUsers();
});

const loadUsers = () => {
  if (plocInstance) plocInstance.loadUsers();
};

const validationErrors = computed(() => {
  const err = useCaseResult.error.value;
  if (!err) return {} as Record<string, string>;
  const withFields = err as Error & { fieldErrors?: Record<string, string> };
  if (withFields.fieldErrors) return withFields.fieldErrors;
  return state.validationErrors ?? {};
});

const handleCreateUser = async () => {
  if (!plocInstance || !newName.value.trim() || !newEmail.value.trim()) return;
  const result = await useCaseResult.execute({ name: newName.value.trim(), email: newEmail.value.trim() });
  if (result) {
    newName.value = '';
    newEmail.value = '';
    await plocInstance.loadUsers();
  }
};

const handleSelectUser = (user: User) => plocInstance?.selectUser(user);
const handleClearSelection = () => plocInstance?.selectUser(null);
const clearError = () => plocInstance?.clearError();

const canCreate = computed(
  () =>
    newName.value.trim() &&
    newEmail.value.trim() &&
    !useCaseResult.loading.value
);
</script>

<template>
  <div class="page">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <h1 class="title">CAF Demo</h1>
        <p class="subtitle">Clean Architecture Frontend – Vue + GraphQL</p>
        <div class="badges">
          <span class="badge">@c.a.f/core</span>
          <span class="badge">@c.a.f/infrastructure-vue</span>
          <span class="badge">@c.a.f/validation</span>
        </div>
      </header>

      <!-- Error Boundary -->
      <div v-if="errorContext?.error" class="alert alert-warn">
        <span>Error Boundary: {{ errorContext.error.message }}</span>
        <button type="button" class="btn btn-sm" @click="errorContext.resetError()">Dismiss</button>
      </div>

      <div class="grid">
        <!-- Users List -->
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">Users List</h2>
            <button type="button" class="btn" :disabled="state?.loading" @click="loadUsers">
              {{ state?.loading ? 'Loading…' : 'Refresh' }}
            </button>
          </div>
          <div v-if="state?.error" class="alert alert-error">
            {{ state.error }}
            <button type="button" class="btn btn-sm" @click="clearError">Clear</button>
          </div>
          <div v-if="state?.loading" class="loading">Loading users…</div>
          <div v-else-if="state?.users?.length === 0" class="empty">No users. Create one below.</div>
          <ul v-else class="user-list">
            <li
              v-for="u in state?.users"
              :key="u.id"
              class="user-item"
              :class="{ selected: state?.selectedUser?.id === u.id }"
              @click="handleSelectUser(u)"
            >
              <span class="user-avatar">{{ (u.name?.[0] ?? '?').toUpperCase() }}</span>
              <div class="user-info">
                <strong>{{ u.name }}</strong>
                <span class="user-email">{{ u.email }}</span>
              </div>
              <span v-if="state?.selectedUser?.id === u.id" class="check">✓</span>
            </li>
          </ul>
        </section>

        <!-- Create User -->
        <section class="card">
          <h2 class="card-title">Create New User</h2>
          <div class="form">
            <div class="field">
              <label>Name</label>
              <input
                v-model="newName"
                type="text"
                placeholder="Name"
                class="input"
                :class="{ invalid: validationErrors.name }"
              />
              <span v-if="validationErrors.name" class="field-error">{{ validationErrors.name }}</span>
            </div>
            <div class="field">
              <label>Email</label>
              <input
                v-model="newEmail"
                type="email"
                placeholder="Email"
                class="input"
                :class="{ invalid: validationErrors.email }"
              />
              <span v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</span>
            </div>
            <div v-if="useCaseResult.error.value" class="alert alert-error">
              {{ useCaseResult.error.value.message }}
            </div>
            <button
              type="button"
              class="btn btn-primary full"
              :disabled="!canCreate"
              @click="handleCreateUser"
            >
              {{ useCaseResult.loading.value ? 'Creating…' : 'Create User' }}
            </button>
          </div>
        </section>
      </div>

      <!-- Selected User -->
      <section v-if="state?.selectedUser" class="card">
        <div class="card-header">
          <h3 class="card-title">Selected User</h3>
          <button type="button" class="btn btn-secondary" @click="handleClearSelection">Clear</button>
        </div>
        <div class="data-grid">
          <div class="data-field"><span class="label">ID</span>{{ state.selectedUser.id }}</div>
          <div class="data-field"><span class="label">Name</span>{{ state.selectedUser.name }}</div>
          <div class="data-field"><span class="label">Email</span>{{ state.selectedUser.email }}</div>
        </div>
      </section>

      <!-- Debug -->
      <section class="card debug">
        <h3 class="card-title">State</h3>
        <div class="data-grid small">
          <div class="data-field"><span class="label">Users</span>{{ state?.users?.length ?? 0 }}</div>
          <div class="data-field"><span class="label">Loading</span>{{ state?.loading ? 'Yes' : 'No' }}</div>
          <div class="data-field"><span class="label">Creating</span>{{ useCaseResult.loading.value ? 'Yes' : 'No' }}</div>
          <div class="data-field"><span class="label">Selected</span>{{ state?.selectedUser?.id ?? 'None' }}</div>
          <div class="data-field"><span class="label">Error</span>{{ state?.error ?? 'None' }}</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}
.title {
  font-size: 2rem;
  margin: 0 0 0.5rem;
}
.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}
.badges {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.badge {
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  font-size: 0.85rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.card-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}
.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.alert-warn {
  background: #fff3cd;
  border: 1px solid #ffc107;
}
.alert-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  cursor: pointer;
  font-size: 0.95rem;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}
.btn-secondary {
  background: #f5f5f5;
}
.full {
  width: 100%;
  margin-top: 0.5rem;
}
.loading,
.empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}
.user-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}
.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  background: #fafafa;
  transition: all 0.2s;
}
.user-item:hover {
  background: #f5f5f5;
}
.user-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.08);
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.user-email {
  font-size: 0.9rem;
  color: #666;
}
.check {
  color: #667eea;
  font-size: 1.2rem;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}
.input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}
.input.invalid {
  border-color: #dc3545;
}
.field-error {
  font-size: 0.85rem;
  color: #dc3545;
}
.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
.data-grid.small {
  font-size: 0.9rem;
}
.data-field .label {
  display: block;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
.debug {
  background: rgba(255, 255, 255, 0.95);
}
</style>
