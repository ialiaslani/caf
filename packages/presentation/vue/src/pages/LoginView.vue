<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" />
      </div>
      <div>
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" />
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { container } from '@caf/core/container'
import { TYPES } from '@caf/core/ports'
import type { ILoginUseCase } from '@caf/core/application'

const username = ref('')
const password = ref('')

const loginUseCase = container.get<ILoginUseCase>(TYPES.LoginUseCase)

const login = async () => {
  try {
    await loginUseCase.execute({
      username: username.value,
      password: password.value,
    })
    alert('Login successful!')
  } catch (error) {
    alert('Login failed!')
  }
}
</script>
