<script setup lang="ts">
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1 class="title">@c-a-f/core Patterns</h1>
        <p class="subtitle">Core architecture patterns used in this app</p>
        <div class="badges">
          <span class="badge">UseCase</span>
          <span class="badge">Ploc</span>
          <span class="badge">RequestResult</span>
          <span class="badge">IUserRepository</span>
        </div>
      </header>

      <section class="card">
        <h2 class="card-title">UseCase pattern</h2>
        <p class="text">
          Use cases (e.g. <strong>GetUsers</strong>, <strong>CreateUser</strong>) encapsulate application logic.
          They implement <code>UseCase&lt;Args, Result&gt;</code> and return <code>RequestResult&lt;T&gt;</code>
          with reactive <code>loading</code>, <code>data</code>, and <code>error</code> (Pulse).
        </p>
        <p class="text">
          In this app, <code>useUseCaseFromContext('createUser')</code> and <code>useUseCase(createUserUseCase)</code>
          from <code>@c-a-f/infrastructure-vue</code> wire the CreateUser use case to the form.
        </p>
      </section>

      <section class="card">
        <h2 class="card-title">Ploc (Presentation Logic)</h2>
        <p class="text">
          <strong>UserPloc</strong> holds UI state (users list, loading, error, selected user, validation errors)
          and coordinates use cases. Components get the ploc via <code>usePlocFromContext('user')</code> and
          <code>usePloc(userPloc)</code> for reactive state.
        </p>
      </section>

      <section class="card">
        <h2 class="card-title">Infrastructure: GraphQL</h2>
        <p class="text">
          <strong>UserGraphQLRepository</strong> implements the same <code>IUserRepository</code> as the React
          example’s REST repo. Only the infrastructure layer differs; domain and application are shared.
        </p>
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
  max-width: 800px;
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
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.card-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}
.text {
  margin: 0 0 1rem;
  color: #444;
  line-height: 1.6;
}
.text:last-child {
  margin-bottom: 0;
}
code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
