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
import { container } from '@c.a.f/core/container'
import { TYPES } from '@c.a.f/core/ports'
import type { ILoginUseCase } from '@c.a.f/example-domain'
import { Login } from '@c.a.f/example-domain'

const username = ref('')
const password = ref('')

const loginUseCase = container.get<ILoginUseCase>(TYPES.LoginUseCase)

const login = async () => {
  try {
    await loginUseCase.execute(
      new Login(username.value, password.value)
    )
    alert('Login successful!')
  } catch (error) {
    alert('Login failed!')
  }
}
</script>
