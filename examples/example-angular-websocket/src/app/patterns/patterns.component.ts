import { Component } from '@angular/core';

/**
 * Patterns page – same structure as React/Vue examples.
 * Describes @c-a-f/core patterns: UseCase, ApiRequest, Ploc.
 */
@Component({
  selector: 'app-patterns',
  standalone: true,
  template: `
    <div class="page">
      <div class="header">
        <h1 class="title">CAF Patterns</h1>
        <p class="subtitle">UseCase, ApiRequest, Ploc – Clean Architecture Frontend</p>
      </div>

      <div class="content">
        <section class="card">
          <h2>1. UseCase Pattern</h2>
          <p>
            Application use cases (e.g. <strong>GetUsers</strong>, <strong>CreateUser</strong>) encapsulate
            business logic and return reactive <code>RequestResult</code> with loading/data/error.
          </p>
          <pre class="code">{{ useCaseSnippet }}</pre>
          <ul>
            <li>Encapsulates business logic in a single, testable unit</li>
            <li>Returns reactive state via RequestResult</li>
            <li>Independent of UI and infrastructure</li>
            <li>See <code>caf/application/User/Queries/GetUsers.ts</code> and <code>Commands/CreateUser.ts</code></li>
          </ul>
        </section>

        <section class="card">
          <h2>2. ApiRequest Pattern</h2>
          <p>
            <strong>ApiRequest</strong> wraps async operations with reactive loading/data/error state.
            It works with Promises or <code>IRequestHandler</code> implementations.
          </p>
          <pre class="code">{{ apiRequestSnippet }}</pre>
        </section>

        <section class="card">
          <h2>3. Ploc (Presentation Logic Container)</h2>
          <p>
            <strong>Ploc</strong> holds presentation state and coordinates use cases. Components
            subscribe to Ploc state (e.g. via <code>plocToObservable</code> + <code>toSignal</code> in Angular).
          </p>
          <ul>
            <li>User Management page uses <code>UserPloc</code> for users list and CreateUser</li>
            <li>This example uses WebSocket for real-time updates; React/Vue examples use HTTP or GraphQL</li>
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 1rem;
      }
      .header {
        text-align: center;
        margin-bottom: 2rem;
        color: white;
      }
      .title { font-size: 2rem; margin: 0 0 0.5rem; }
      .subtitle { font-size: 1.1rem; opacity: 0.9; }
      .content { max-width: 800px; margin: 0 auto; }
      .card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      .card h2 { margin: 0 0 0.75rem; font-size: 1.25rem; }
      .card p { color: #444; line-height: 1.6; margin-bottom: 1rem; }
      .card ul { margin: 0; padding-left: 1.5rem; color: #444; }
      .card li { margin-bottom: 0.25rem; }
      .code {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 0.85rem;
        white-space: pre-wrap;
        margin: 0 0 1rem;
      }
      code { background: #f0f0f0; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    `,
  ],
})
export class PatternsComponent {
  useCaseSnippet = `class CreateUser implements UseCase<[CreateUserInput], User> {
  async execute(user: CreateUserInput): Promise<RequestResult<User>> {
    const createdUser = await this.userService.createUser(user);
    return {
      loading: pulse(false),
      data: pulse(createdUser),
      error: pulse(null),
    };
  }
}`;

  apiRequestSnippet = `const request = new ApiRequest(
  new MockDataHandler(data)
);
// request.loading, request.data, request.error`;
}
