import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { 
  usePloc, 
  usePlocFromContext, 
  useUseCaseFromContext, 
  useUseCase,
  usePlocDevTools,
  useTrackPloc,
  useUseCaseDevTools,
  useCAFDevTools,
  useCAFError,
} from '@c.a.f/infrastructure-react';
import type { User } from '../../caf/domain';
import type { UserPloc } from '../../caf/application';
import type { UserState } from '../../caf/application/User/Ploc';
import type { CreateUserInput } from '../../caf/domain/User/user.validation';
import type { UseCase, RequestResult } from '@c.a.f/core';
import { pulse } from '@c.a.f/core';
import { setupUserPloc } from '../../caf/setup';
import { WorkflowManager, type WorkflowStateSnapshot } from '@c.a.f/workflow';
import { userCreationWorkflow, type UserCreationContext } from '../workflows/userCreationWorkflow';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  DataField,
  EmptyState,
  GlobalStyles,
  Input,
  Spinner,
  Title,
} from './ui';

/**
 * React component demonstrating @c.a.f/core functionality:
 * - UseCase pattern
 * - Ploc (Presentation Logic Container) with reactive state
 * - ApiRequest (async request wrapper)
 * - IRequestHandler (Mock API implementation)
 * - usePlocFromContext hook from @c.a.f/infrastructure-react
 * - useUseCaseFromContext and useUseCase hooks for CreateUser form
 */
// Fallback UseCase that does nothing - used to ensure hooks are always called
const fallbackCreateUserUseCase: UseCase<[CreateUserInput], User> = {
  async execute(): Promise<RequestResult<User>> {
    return {
      loading: pulse(false),
      data: pulse(null! as User),
      error: pulse(new Error('CreateUser use case not available')),
    };
  },
};

export function UserManagement() {
  // Get error context from CAFErrorBoundary (if any errors occurred)
  const errorContext = useCAFError();
  
  // Get UserPloc from CAFProvider context
  const userPloc = usePlocFromContext<UserPloc>('user');
  
  // Get CreateUser use case from context
  const createUserUseCase = useUseCaseFromContext<[CreateUserInput], User>('createUser');
  
  // Create fallback ploc to ensure hooks are always called unconditionally
  // In production, CAFProvider should always provide the ploc
  const fallbackPloc = useMemo(() => {
    return userPloc || setupUserPloc();
  }, [userPloc]);
  
  // All hooks must be called unconditionally
  const [state, plocInstance] = usePloc(fallbackPloc) as [UserState, UserPloc];
  
  // Get CAF DevTools context to access enabled state
  const cafDevTools = useCAFDevTools();
  
  // DevTools: Track UserPloc with useTrackPloc (automatically registers with useCAFDevTools)
  useTrackPloc(plocInstance, 'UserPloc');
  
  // DevTools: Add usePlocDevTools for UserPloc (provides state history, time-travel debugging)
  const plocDevTools = usePlocDevTools(plocInstance, {
    name: 'UserPloc',
    enabled: cafDevTools.enabled && import.meta.env.DEV,
  });
  
  // DevTools: Optionally add useUseCaseDevTools for CreateUser use case
  const useCaseDevTools = useUseCaseDevTools({
    name: 'CreateUser',
    enabled: cafDevTools.enabled && import.meta.env.DEV,
    logExecutionTime: true,
  });
  
  // Wrap CreateUser use case with DevTools tracking (if use case is available)
  const trackedCreateUserUseCase = useMemo(() => {
    if (createUserUseCase && useCaseDevTools) {
      return useCaseDevTools.wrap(createUserUseCase);
    }
    return createUserUseCase;
  }, [createUserUseCase, useCaseDevTools]);
  
  // Use the tracked use case (or fallback)
  const useCaseResult = useUseCase(trackedCreateUserUseCase || fallbackCreateUserUseCase);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  
  // Store callbacks in refs to avoid recreating workflow
  const executeCreateUserRef = useRef<((user: CreateUserInput) => Promise<User | null>) | null>(null);
  const plocInstanceRef = useRef<UserPloc | null>(null);
  const workflowRef = useRef<typeof workflow | null>(null);
  const isExecutingRef = useRef<boolean>(false);
  
  // Create WorkflowManager for user creation workflow
  const workflowManager = useMemo(() => {
    return new WorkflowManager(userCreationWorkflow, {
      userName: '',
      userEmail: '',
    } as UserCreationContext);
  }, []);
  
  // Subscribe to workflow state
  const [workflowState, workflow] = usePloc(workflowManager);
  
  // Update refs when values change
  useEffect(() => {
    executeCreateUserRef.current = useCaseResult?.execute || null;
    plocInstanceRef.current = plocInstance;
    workflowRef.current = workflow;
  }, [useCaseResult, plocInstance, workflow]);
  
  // Update workflow context when form values change
  useEffect(() => {
    workflow.updateContext({
      userName: newUserName,
      userEmail: newUserEmail,
    });
  }, [newUserName, newUserEmail, workflow]);
  
  // Track previous state to detect state transitions
  const previousStateRef = useRef<WorkflowStateSnapshot | null>(null);
  
  // Setup workflow subscription to handle state transitions
  useEffect(() => {
    const handleStateChange = async (snapshot: WorkflowStateSnapshot) => {
      const previousState = previousStateRef.current?.currentState;
      const currentState = snapshot.currentState;
      
      // Only process if state actually changed
      if (previousState === currentState) return;
      
      const context = snapshot.context as UserCreationContext;
      const workflow = workflowRef.current;
      if (!workflow) return;
      
      // Handle state transitions
      if (previousState !== 'validating' && currentState === 'validating') {
        // Entering validating state - perform basic validation
        const { userName, userEmail } = context;
        
        if (!userName?.trim() || !userEmail?.trim()) {
          workflow.updateContext({
            validationErrors: {
              name: !userName?.trim() ? 'Name is required' : '',
              email: !userEmail?.trim() ? 'Email is required' : '',
            },
          });
          await workflow.dispatch('fail');
          return;
        }
        
        // Basic validation passed - proceed to creating
        await workflow.dispatch('proceed');
      }
      
      if (previousState !== 'creating' && currentState === 'creating') {
        // Prevent double execution
        if (isExecutingRef.current) {
          return;
        }
        
        // Entering creating state - create the user via use case
        const { userName, userEmail } = context;
        const executeCreateUser = executeCreateUserRef.current;
        const ploc = plocInstanceRef.current;
        
        if (!userName || !userEmail || !executeCreateUser || !ploc) {
          workflow.updateContext({ 
            error: new Error('Missing required data or dependencies') 
          });
          await workflow.dispatch('error');
          return;
        }
        
        try {
          isExecutingRef.current = true;
          // Execute use case - this will validate (via ValidationRunner) and create the user
          const result = await executeCreateUser({ name: userName, email: userEmail });
          
          if (result) {
            // Success - update context and transition to success
            workflow.updateContext({ 
              createdUser: result,
              error: undefined,
              validationErrors: undefined,
            });
            await workflow.dispatch('success');
            // Reload users list
            await ploc.loadUsers();
          } else {
            // No result - check if there's an error from useCaseResult
            // Note: We can't access useCaseResult here since it's not in scope,
            // but the error should be caught by the catch block or returned from executeCreateUser
            workflow.updateContext({ 
              error: new Error('User creation failed - no result returned'),
            });
            await workflow.dispatch('error');
          }
        } catch (error) {
          // Handle unexpected errors
          workflow.updateContext({ 
            error: error as Error,
            validationErrors: {},
          });
          await workflow.dispatch('error');
        } finally {
          isExecutingRef.current = false;
        }
      }
      
      if (previousState !== 'success' && currentState === 'success') {
        // Entering success state - reset form and auto-reset workflow
        setNewUserName('');
        setNewUserEmail('');
        // Auto-reset after 2 seconds
        setTimeout(async () => {
          const workflow = workflowRef.current;
          if (workflow) {
            await workflow.dispatch('reset');
          }
        }, 2000);
      }
      
      // Update previous state
      previousStateRef.current = snapshot;
    };
    
    // Subscribe to workflow state changes
    workflowManager.subscribe(handleStateChange);
    
    // Initialize with current state
    previousStateRef.current = workflowManager.getState();
    
    return () => {
      workflowManager.unsubscribe(handleStateChange);
      isExecutingRef.current = false; // Reset execution flag on cleanup
    };
  }, [workflowManager]); // Only depend on workflowManager, which is stable
  
  // Define loadUsers before useEffect
  const loadUsers = useCallback(async () => {
    if (plocInstance) {
      await plocInstance.loadUsers();
    }
  }, [plocInstance]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  
  // Note: executeCreateUser is stored in ref for use in workflow effects
  const isCreating = useCaseResult.loading;
  const createUserError = useCaseResult.error;
  
  // Extract validation errors from workflow context or error object
  const validationErrors = useMemo(() => {
    // First check workflow context for validation errors
    const workflowContext = workflowState.context as UserCreationContext;
    if (workflowContext.validationErrors) {
      return workflowContext.validationErrors;
    }
    
    // Fallback to error object
    if (!createUserError) return {};
    
    // Check if error has fieldErrors property (from UserValidationError)
    const errorWithFieldErrors = createUserError as Error & { fieldErrors?: Record<string, string> };
    if (errorWithFieldErrors.fieldErrors && typeof errorWithFieldErrors.fieldErrors === 'object') {
      return errorWithFieldErrors.fieldErrors;
    }
    
    // Try to parse validation errors from error message
    if (createUserError.message.includes('Validation failed:')) {
      const errorParts = createUserError.message.split('Validation failed:')[1]?.split(';') || [];
      const errors: Record<string, string> = {};
      errorParts.forEach((part) => {
        const trimmed = part.trim();
        if (trimmed.includes(':')) {
          const [field, ...messageParts] = trimmed.split(':');
          const fieldName = field.trim().toLowerCase();
          errors[fieldName] = messageParts.join(':').trim();
        }
      });
      return errors;
    }
    
    return {};
  }, [workflowState.context, createUserError]);
  
  // Early return after all hooks
  if (!userPloc || !createUserUseCase) {
    return <div>UserPloc or CreateUser use case not found in context. Make sure CAFProvider is set up correctly.</div>;
  }


  /**
   * Handle Create User - Simple: just start the workflow
   * The workflow effects will handle validation and creation automatically
   */
  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    
    // Update context with current form values
    workflow.updateContext({
      userName: newUserName,
      userEmail: newUserEmail,
    });
    
    // Start the workflow - effects will handle the rest
    await workflow.dispatch('start');
  };
  
  const handleWorkflowReset = async () => {
    await workflow.dispatch('reset');
    setNewUserName('');
    setNewUserEmail('');
    workflow.updateContext({
      userName: '',
      userEmail: '',
      validationErrors: undefined,
      error: undefined,
      createdUser: undefined,
    });
  };
  
  const handleWorkflowRetry = async () => {
    // Retry from error state - goes back to creating
    await workflow.dispatch('retry');
  };
  
  const handleWorkflowCancel = async () => {
    // Cancel from creating state - goes back to idle
    await workflow.dispatch('cancel');
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleSelectUser = (user: User) => plocInstance.selectUser(user);
  const handleClearSelection = () => plocInstance.selectUser(null);
  const clearValidationError = (field: 'name' | 'email') => {
    if (state.validationErrors[field]) {
      plocInstance.changeState({
        ...plocInstance.state,
        validationErrors: { ...plocInstance.state.validationErrors, [field]: '' },
      });
    }
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
          <Title as="h1">CAF Demo</Title>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
            Clean Architecture Frontend - Reactive State Management
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Badge>@c.a.f/core</Badge>
            <Badge>@c.a.f/infrastructure-react</Badge>
            <Badge>@c.a.f/validation</Badge>
            <Badge>@c.a.f/workflow</Badge>
            <Badge>@c.a.f/devtools</Badge>
          </div>
        </div>

        {/* Error Boundary Error Display */}
        {errorContext?.error && (
          <div style={{ marginBottom: '2rem', maxWidth: '1200px', margin: '0 auto 2rem' }}>
            <Alert
              message={`⚠️ Error Boundary Error: ${errorContext.error.message}`}
              onDismiss={errorContext.resetError}
            />
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Users List Card */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Title as="h2" style={{ marginBottom: 0 }}>
                Users List
              </Title>
              <Button onClick={loadUsers} disabled={state.loading}>
                {state.loading ? '⏳ Loading...' : '🔄 Refresh'}
              </Button>
            </div>

            {state.error && (
              <Alert message={`⚠️ ${state.error}`} onDismiss={() => plocInstance.clearError()} />
            )}

            {state.loading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <Spinner />
                <p style={{ marginTop: '1rem' }}>Loading users...</p>
              </div>
            )}

            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {state.users.length === 0 && !state.loading && (
                <EmptyState message="No users found. Create one below!" />
              )}
              {state.users.map((user) => {
                const isSelected = state.selectedUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      border: isSelected ? '2px solid #667eea' : '1px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                        : '#fafafa',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f5f5f5';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#fafafa';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <Avatar initial={user.name?.[0]?.toUpperCase() || '?'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>
                        {user.name || '(No name)'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {user.email || '(No email)'}
                      </div>
                    </div>
                    {isSelected && <span style={{ color: '#667eea', fontSize: '1.2rem' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Create User Card */}
          <Card>
            <Title as="h2">Create New User</Title>
            
            {/* Workflow State Display */}
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#666' }}>Workflow State:</span>
                <Badge style={{ 
                  background: workflowState.currentState === 'idle' ? '#e0e0e0' :
                             workflowState.currentState === 'validating' ? '#ffa726' :
                             workflowState.currentState === 'creating' ? '#42a5f5' :
                             workflowState.currentState === 'success' ? '#66bb6a' :
                             workflowState.currentState === 'error' ? '#ef5350' : '#e0e0e0',
                  color: workflowState.currentState === 'idle' ? '#666' : 'white',
                  fontWeight: '600'
                }}>
                  {String(workflowState.currentState).toUpperCase()}
                </Badge>
              </div>
              
              {/* State Transitions */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Available Transitions:</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {workflow.canTransition('start') && (
                    <Button 
                      variant="secondary" 
                      onClick={() => workflow.dispatch('start')}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Start
                    </Button>
                  )}
                  {workflow.canTransition('proceed') && workflowState.currentState === 'validating' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => workflow.dispatch('proceed')}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Proceed
                    </Button>
                  )}
                  {workflow.canTransition('fail') && workflowState.currentState === 'validating' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => workflow.dispatch('fail')}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Fail
                    </Button>
                  )}
                  {workflow.canTransition('error') && workflowState.currentState === 'creating' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => workflow.dispatch('error')}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Error
                    </Button>
                  )}
                  {workflow.canTransition('retry') && (
                    <Button 
                      variant="secondary" 
                      onClick={handleWorkflowRetry}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Retry
                    </Button>
                  )}
                  {workflow.canTransition('reset') && (
                    <Button 
                      variant="secondary" 
                      onClick={handleWorkflowReset}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Reset
                    </Button>
                  )}
                  {workflow.canTransition('cancel') && (
                    <Button 
                      variant="secondary" 
                      onClick={handleWorkflowCancel}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Name"
                type="text"
                placeholder="Enter user name"
                value={newUserName}
                onChange={(e) => {
                  setNewUserName(e.target.value);
                  clearValidationError('name');
                }}
                error={state.validationErrors.name || validationErrors.name || validationErrors['name']}
                disabled={workflowState.currentState === 'creating' || workflowState.currentState === 'validating'}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter user email"
                value={newUserEmail}
                onChange={(e) => {
                  setNewUserEmail(e.target.value);
                  clearValidationError('email');
                }}
                error={state.validationErrors.email || validationErrors.email || validationErrors['email']}
                disabled={workflowState.currentState === 'creating' || workflowState.currentState === 'validating'}
              />
              {createUserError && (
                <Alert message={`⚠️ ${createUserError.message}`} />
              )}
              {/* Display formatted validation errors */}
              {Object.keys(validationErrors).length > 0 && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#fff3cd', 
                  border: '1px solid #ffc107', 
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#856404' }}>
                    Validation Errors:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#856404' }}>
                    {Object.entries(validationErrors).map(([field, message]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button
                onClick={handleCreateUser}
                disabled={
                  workflowState.currentState === 'creating' || 
                  workflowState.currentState === 'validating' ||
                  !newUserName.trim() || 
                  !newUserEmail.trim() || 
                  !createUserUseCase ||
                  workflowState.currentState === 'success'
                }
                fullWidth
                style={{ marginTop: '0.5rem' }}
              >
                {workflowState.currentState === 'idle' && '➕ Create User'}
                {workflowState.currentState === 'validating' && '⏳ Validating...'}
                {workflowState.currentState === 'creating' && '⏳ Creating...'}
                {workflowState.currentState === 'success' && '✅ Success!'}
                {workflowState.currentState === 'error' && '❌ Error - Try Again'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Selected User Card */}
        {state.selectedUser && (
          <Card style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Title as="h3">Selected User</Title>
              <Button variant="secondary" onClick={handleClearSelection}>
                Clear Selection
              </Button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <DataField label="ID" value={state.selectedUser.id} />
              <DataField label="Name" value={state.selectedUser.name} />
              <DataField label="Email" value={state.selectedUser.email} />
            </div>
          </Card>
        )}

        {/* Debug Info Card */}
        <Card style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <Title as="h3" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            🔍 State Debug Info
          </Title>
          
          {/* Packages Section */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
            <Title as="h3" style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#666' }}>
              📦 CAF Packages Used
            </Title>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <Badge style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>@c.a.f/core</Badge>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>✓</span>
              </div>
              <div>
                <Badge style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>@c.a.f/infrastructure-react</Badge>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>✓</span>
              </div>
              <div>
                <Badge style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>@c.a.f/validation</Badge>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>✓</span>
              </div>
              <div>
                <Badge style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>@c.a.f/workflow</Badge>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>✓</span>
              </div>
              <div>
                <Badge style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>@c.a.f/devtools</Badge>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>✓</span>
              </div>
            </div>
          </div>

          {/* State Info Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              fontSize: '0.9rem',
            }}
          >
            <div>
              <span style={{ color: '#666' }}>Users Count:</span>{' '}
              <strong style={{ color: '#667eea' }}>{state.users.length}</strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>Loading:</span>{' '}
              <strong style={{ color: state.loading ? '#667eea' : '#999' }}>
                {state.loading ? 'Yes' : 'No'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>Creating:</span>{' '}
              <strong style={{ color: isCreating ? '#667eea' : '#999' }}>
                {isCreating ? 'Yes' : 'No'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>Selected:</span>{' '}
              <strong style={{ color: state.selectedUser ? '#667eea' : '#999' }}>
                {state.selectedUser?.id || 'None'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>Error:</span>{' '}
              <strong style={{ color: state.error ? '#ff6b6b' : '#999' }}>
                {state.error || 'None'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>Error Boundary:</span>{' '}
              <strong style={{ color: errorContext?.error ? '#ff6b6b' : '#999' }}>
                {errorContext?.error ? 'Error' : 'OK'}
              </strong>
            </div>
          </div>
          
          {/* DevTools Info Section */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
              <Title as="h3" style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#666' }}>
                🛠️ DevTools Info
              </Title>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: '#666' }}>Ploc State History:</span>{' '}
                  <strong style={{ color: '#667eea' }}>
                    {plocDevTools?.getStateHistory().length || 0} states
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#666' }}>UseCase Executions:</span>{' '}
                  <strong style={{ color: '#667eea' }}>
                    {useCaseDevTools?.getStatistics().totalExecutions || 0}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Avg Execution Time:</span>{' '}
                  <strong style={{ color: '#667eea' }}>
                    {useCaseDevTools?.getStatistics().averageDuration 
                      ? `${Math.round(useCaseDevTools.getStatistics().averageDuration)}ms`
                      : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#666' }}>DevTools Enabled:</span>{' '}
                  <strong style={{ color: cafDevTools.enabled ? '#4caf50' : '#999' }}>
                    {cafDevTools.enabled ? 'Yes' : 'No'}
                  </strong>
                </div>
              </div>
              {import.meta.env.DEV && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                  💡 Access DevTools via: <code style={{ background: '#f5f5f5', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>window.__CAF_DEVTOOLS__</code>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <GlobalStyles />
    </div>
  );
}
