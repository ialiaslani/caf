import { createApp, h } from 'vue';
import App from './App.vue';
import router from './router';
import { CAFProvider, CAFErrorBoundary } from '@c-a-f/infrastructure-vue';
import { setupUserPloc } from '../caf/setup';

const { userPloc, createUserUseCase } = setupUserPloc(import.meta.env.VITE_GRAPHQL_URL, {
  withUseCase: true,
});

function errorFallback(props: { error: Error; resetError: () => void }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      },
    },
    [
      h('h2', { style: { fontSize: '2rem', marginBottom: '1rem' } }, 'Oops! Something went wrong'),
      h('p', { style: { marginBottom: '1rem', opacity: 0.9 } }, props.error.message),
      h(
        'button',
        {
          style: {
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          },
          onClick: props.resetError,
        },
        'Try again'
      ),
    ]
  );
}

const app = createApp({
  render: () =>
    h(
      CAFErrorBoundary,
      { fallback: errorFallback },
      {
        default: () =>
          h(
            CAFProvider,
            { plocs: { user: userPloc }, useCases: { createUser: createUserUseCase } },
            { default: () => h(App) }
          ),
      }
    ),
});
app.use(router);
app.mount('#app');
