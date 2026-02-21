import { useEffect, useState, useMemo } from 'react';
import { ApiRequest } from '@c-a-f/core';
import type { IRequestHandler } from '@c-a-f/core';
import { Card, Title, Button, Badge, DataField, Spinner, Alert } from './ui';
import { GlobalStyles } from './ui';

/**
 * Patterns Page - Demonstrates @c-a-f/core patterns:
 * 1. UseCase Pattern - Application use cases (GetUsers, CreateUser)
 * 2. ApiRequest Pattern - Reactive async request wrapper with loading/data/error state
 */

// Example IRequestHandler implementation for ApiRequest
class MockDataHandler<T> implements IRequestHandler<T> {
  constructor(
    private mockData: T,
    private delay: number = 500
  ) {}

  async execute(): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.mockData;
  }
}

// Example error handler
class ErrorHandler<T> implements IRequestHandler<T> {
  constructor(
    private errorMessage: string,
    private delay: number = 500
  ) {}

  async execute(): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    throw new Error(this.errorMessage);
  }
}

interface ExampleData {
  id: string;
  message: string;
  timestamp: number;
}

export function PatternsPage() {
  // ApiRequest Pattern Example 1: Simple Promise
  const simpleApiRequest = useMemo(
    () => new ApiRequest<ExampleData>(
      Promise.resolve({
        id: '1',
        message: 'Hello from Promise-based ApiRequest!',
        timestamp: Date.now(),
      })
    ),
    []
  );

  // ApiRequest Pattern Example 2: IRequestHandler (Mock)
  const handlerApiRequest = useMemo(
    () => new ApiRequest<ExampleData>(
      new MockDataHandler<ExampleData>({
        id: '2',
        message: 'Hello from IRequestHandler-based ApiRequest!',
        timestamp: Date.now(),
      }, 800)
    ),
    []
  );

  // ApiRequest Pattern Example 3: Error handling
  const errorApiRequest = useMemo(
    () => new ApiRequest<ExampleData>(
      new ErrorHandler<ExampleData>('Simulated API error', 600)
    ),
    []
  );

  const [simpleState, setSimpleState] = useState({
    loading: false,
    data: null as ExampleData | null,
    error: null as Error | null,
  });

  const [handlerState, setHandlerState] = useState({
    loading: false,
    data: null as ExampleData | null,
    error: null as Error | null,
  });

  const [errorState, setErrorState] = useState({
    loading: false,
    data: null as ExampleData | null,
    error: null as Error | null,
  });

  // Subscribe to ApiRequest reactive state
  useEffect(() => {
    const loadingListener = (loading: boolean) => {
      setSimpleState(prev => ({ ...prev, loading }));
    };
    const dataListener = (data: ExampleData | null) => {
      setSimpleState(prev => ({ ...prev, data }));
    };
    const errorListener = (error: Error | null) => {
      setSimpleState(prev => ({ ...prev, error }));
    };

    simpleApiRequest.loading.subscribe(loadingListener);
    simpleApiRequest.data.subscribe(dataListener);
    simpleApiRequest.error.subscribe(errorListener);

    return () => {
      simpleApiRequest.loading.unsubscribe(loadingListener);
      simpleApiRequest.data.unsubscribe(dataListener);
      simpleApiRequest.error.unsubscribe(errorListener);
    };
  }, [simpleApiRequest]);

  useEffect(() => {
    const loadingListener = (loading: boolean) => {
      setHandlerState(prev => ({ ...prev, loading }));
    };
    const dataListener = (data: ExampleData | null) => {
      setHandlerState(prev => ({ ...prev, data }));
    };
    const errorListener = (error: Error | null) => {
      setHandlerState(prev => ({ ...prev, error }));
    };

    handlerApiRequest.loading.subscribe(loadingListener);
    handlerApiRequest.data.subscribe(dataListener);
    handlerApiRequest.error.subscribe(errorListener);

    return () => {
      handlerApiRequest.loading.unsubscribe(loadingListener);
      handlerApiRequest.data.unsubscribe(dataListener);
      handlerApiRequest.error.unsubscribe(errorListener);
    };
  }, [handlerApiRequest]);

  useEffect(() => {
    const loadingListener = (loading: boolean) => {
      setErrorState(prev => ({ ...prev, loading }));
    };
    const dataListener = (data: ExampleData | null) => {
      setErrorState(prev => ({ ...prev, data }));
    };
    const errorListener = (error: Error | null) => {
      setErrorState(prev => ({ ...prev, error }));
    };

    errorApiRequest.loading.subscribe(loadingListener);
    errorApiRequest.data.subscribe(dataListener);
    errorApiRequest.error.subscribe(errorListener);

    return () => {
      errorApiRequest.loading.unsubscribe(loadingListener);
      errorApiRequest.data.unsubscribe(dataListener);
      errorApiRequest.error.unsubscribe(errorListener);
    };
  }, [errorApiRequest]);

  const handleSimpleRequest = async () => {
    await simpleApiRequest.mutate({
      onSuccess: (data) => {
        console.log('Simple request succeeded:', data);
      },
    });
  };

  const handleHandlerRequest = async () => {
    await handlerApiRequest.mutate({
      onSuccess: (data) => {
        console.log('Handler request succeeded:', data);
      },
    });
  };

  const handleErrorRequest = async () => {
    await errorApiRequest.mutate();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', color: 'white' }}>
          <Title as="h1">@c-a-f/core Patterns</Title>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
            Core Architecture Patterns Demonstration
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Badge>UseCase Pattern</Badge>
            <Badge>ApiRequest Pattern</Badge>
            <Badge>IRequestHandler</Badge>
            <Badge>Reactive State</Badge>
          </div>
        </div>

        {/* UseCase Pattern Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <Title as="h2" style={{ marginBottom: '1rem' }}>
            📋 UseCase Pattern
          </Title>
          <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: '1.6' }}>
            The <strong>UseCase</strong> pattern encapsulates application business logic. Each use case implements
            the <code>UseCase&lt;A, T&gt;</code> interface and returns a <code>RequestResult&lt;T&gt;</code> with
            reactive loading/data/error state.
          </p>
          
          <div style={{ 
            background: '#f5f5f5', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            overflowX: 'auto'
          }}>
            <div style={{ marginBottom: '0.5rem', color: '#667eea', fontWeight: 'bold' }}>
              Example: GetUsers UseCase
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`class GetUsers implements UseCase<[], User[]> {
  async execute(): Promise<RequestResult<User[]>> {
    const users = await this.userService.getUsers();
    return {
      loading: pulse(false),
      data: pulse(users),
      error: pulse(null! as Error),
    };
  }
}`}
            </pre>
          </div>

          <div style={{ 
            background: '#f5f5f5', 
            padding: '1.5rem', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            overflowX: 'auto'
          }}>
            <div style={{ marginBottom: '0.5rem', color: '#667eea', fontWeight: 'bold' }}>
              Example: CreateUser UseCase
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`class CreateUser implements UseCase<[CreateUserInput], User> {
  async execute(user: CreateUserInput): Promise<RequestResult<User>> {
    // Validation and business logic
    const createdUser = await this.userService.createUser(user);
    return {
      loading: pulse(false),
      data: pulse(createdUser),
      error: pulse(null! as Error),
    };
  }
}`}
            </pre>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
            <strong>Key Benefits:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Encapsulates business logic in a single, testable unit</li>
              <li>Returns reactive state (loading/data/error) via RequestResult</li>
              <li>Independent of UI framework and infrastructure</li>
              <li>See <code>caf/application/User/Queries/GetUsers.ts</code> and <code>Commands/CreateUser.ts</code></li>
            </ul>
          </div>
        </Card>

        {/* ApiRequest Pattern Section */}
        <Card style={{ marginBottom: '2rem' }}>
          <Title as="h2" style={{ marginBottom: '1rem' }}>
            🔄 ApiRequest Pattern
          </Title>
          <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: '1.6' }}>
            The <strong>ApiRequest</strong> pattern wraps async operations with reactive loading/data/error state.
            It can work with Promises or <code>IRequestHandler</code> implementations, allowing you to swap
            between real APIs, mocks, and cached implementations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Example 1: Promise-based */}
            <Card style={{ background: '#fafafa' }}>
              <Title as="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                1. Promise-based ApiRequest
              </Title>
              <div style={{ 
                background: '#fff', 
                padding: '1rem', 
                borderRadius: '6px',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                overflowX: 'auto'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`const request = new ApiRequest(
  Promise.resolve(data)
);`}
                </pre>
              </div>
              <Button 
                onClick={handleSimpleRequest} 
                disabled={simpleState.loading}
                fullWidth
                style={{ marginBottom: '1rem' }}
              >
                {simpleState.loading ? '⏳ Loading...' : '▶ Run Example'}
              </Button>
              {simpleState.loading && (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <Spinner />
                </div>
              )}
              {simpleState.data && (
                <div style={{ padding: '0.75rem', background: '#e8f5e9', borderRadius: '6px', fontSize: '0.9rem' }}>
                  <strong>✓ Success:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    <DataField label="ID" value={simpleState.data.id} />
                    <DataField label="Message" value={simpleState.data.message} />
                  </div>
                </div>
              )}
              {simpleState.error && (
                <Alert message={`Error: ${simpleState.error.message}`} />
              )}
            </Card>

            {/* Example 2: IRequestHandler-based */}
            <Card style={{ background: '#fafafa' }}>
              <Title as="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                2. IRequestHandler-based ApiRequest
              </Title>
              <div style={{ 
                background: '#fff', 
                padding: '1rem', 
                borderRadius: '6px',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                overflowX: 'auto'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`class MockHandler implements IRequestHandler<T> {
  async execute(): Promise<T> {
    return mockData;
  }
}

const request = new ApiRequest(
  new MockHandler()
);`}
                </pre>
              </div>
              <Button 
                onClick={handleHandlerRequest} 
                disabled={handlerState.loading}
                fullWidth
                style={{ marginBottom: '1rem' }}
              >
                {handlerState.loading ? '⏳ Loading...' : '▶ Run Example'}
              </Button>
              {handlerState.loading && (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <Spinner />
                </div>
              )}
              {handlerState.data && (
                <div style={{ padding: '0.75rem', background: '#e8f5e9', borderRadius: '6px', fontSize: '0.9rem' }}>
                  <strong>✓ Success:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    <DataField label="ID" value={handlerState.data.id} />
                    <DataField label="Message" value={handlerState.data.message} />
                  </div>
                </div>
              )}
              {handlerState.error && (
                <Alert message={`Error: ${handlerState.error.message}`} />
              )}
            </Card>

            {/* Example 3: Error handling */}
            <Card style={{ background: '#fafafa' }}>
              <Title as="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                3. Error Handling
              </Title>
              <div style={{ 
                background: '#fff', 
                padding: '1rem', 
                borderRadius: '6px',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                overflowX: 'auto'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`const request = new ApiRequest(
  new ErrorHandler('Error message')
);

await request.mutate();
// Check request.error.value`}
                </pre>
              </div>
              <Button 
                onClick={handleErrorRequest} 
                disabled={errorState.loading}
                fullWidth
                style={{ marginBottom: '1rem' }}
              >
                {errorState.loading ? '⏳ Loading...' : '▶ Run Example'}
              </Button>
              {errorState.loading && (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <Spinner />
                </div>
              )}
              {errorState.error && (
                <Alert message={`Error: ${errorState.error.message}`} />
              )}
            </Card>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
            <strong>Key Benefits:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Reactive state: <code>loading</code>, <code>data</code>, <code>error</code> are Pulse values</li>
              <li>Subscribe to state changes: <code>request.loading.subscribe(...)</code></li>
              <li>Swap implementations: Use Promises or IRequestHandler (real API, mocks, cached)</li>
              <li>Call <code>mutate()</code> to execute the request</li>
            </ul>
          </div>
        </Card>

        {/* Code Examples Section */}
        <Card>
          <Title as="h2" style={{ marginBottom: '1rem' }}>
            💻 Complete Code Examples
          </Title>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <Title as="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              UseCase Implementation Location
            </Title>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '1rem', 
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Query UseCase:</strong> <code>caf/application/User/Queries/GetUsers.ts</code>
              </div>
              <div>
                <strong>Command UseCase:</strong> <code>caf/application/User/Commands/CreateUser.ts</code>
              </div>
            </div>
          </div>

          <div>
            <Title as="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
              ApiRequest Usage in Ploc
            </Title>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '1.5rem', 
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              overflowX: 'auto'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`// In UserPloc (caf/application/User/Ploc/UserPloc.ts)
async loadUsers(): Promise<void> {
  const result = await this.getUsersUseCase.execute();
  
  // Update state from RequestResult
  this.changeState({
    ...this.state,
    loading: result.loading.value,
    users: result.data.value || [],
    error: result.error.value?.message || null,
  });
}`}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      <GlobalStyles />
    </div>
  );
}
