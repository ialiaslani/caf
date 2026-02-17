import { useEffect, useState } from 'react';
import { UserPloc } from '../../caf/application/User/Ploc';
import type { User } from '../../caf/domain';
import { setupUserPloc } from '../../caf/setup';

/**
 * React component demonstrating @c.a.f/core functionality:
 * - UseCase pattern
 * - Ploc (Presentation Logic Container) with reactive state
 * - ApiRequest (async request wrapper)
 * - IRequestHandler (Mock API implementation)
 */
export function UserManagement() {
  const [ploc] = useState<UserPloc>(() => setupUserPloc());
  const [state, setState] = useState(ploc.state);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  // Subscribe to Ploc state changes
  useEffect(() => {
    const stateListener = (newState: typeof ploc.state) => {
      setState(newState);
    };

    // Subscribe to Ploc state changes
    ploc.subscribe(stateListener);

    // Set initial state
    setState(ploc.state);

    return () => {
      ploc.unsubscribe(stateListener);
    };
  }, [ploc]);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    await ploc.loadUsers();
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      return;
    }

    setIsCreating(true);
    
    try {
      await ploc.createUser({
        name: newUserName,
        email: newUserEmail,
      });
      
      setNewUserName('');
      setNewUserEmail('');
    } catch (err) {
      // Error is handled by Ploc state
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectUser = (user: User) => {
    ploc.selectUser(user);
  };

  const handleClearSelection = () => {
    ploc.selectUser(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: 'white',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            @c.a.f/core Demo
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            marginBottom: '1.5rem',
          }}>
            Clean Architecture Frontend - Reactive State Management
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}>UseCase Pattern</span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}>Ploc State</span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}>Mock API</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Users List Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                margin: 0,
              }}>
                Users List
              </h2>
              <button 
                onClick={loadUsers} 
                disabled={state.loading}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: state.loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: state.loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: state.loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!state.loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!state.loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {state.loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {state.error && (
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: 'white',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              }}>
                <span>⚠️ {state.error}</span>
                <button 
                  onClick={() => ploc.clearError()} 
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  ✕
                </button>
              </div>
            )}

            {state.loading && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666',
              }}>
                <div style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <p style={{ marginTop: '1rem' }}>Loading users...</p>
              </div>
            )}

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              paddingRight: '0.5rem',
            }}>
              {state.users.length === 0 && !state.loading && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: '#999',
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  <p>No users found. Create one below!</p>
                </div>
              )}
              {state.users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    border: state.selectedUser?.id === user.id 
                      ? '2px solid #667eea' 
                      : '1px solid #e0e0e0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: state.selectedUser?.id === user.id 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                      : '#fafafa',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                  onMouseEnter={(e) => {
                    if (state.selectedUser?.id !== user.id) {
                      e.currentTarget.style.background = '#f5f5f5';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (state.selectedUser?.id !== user.id) {
                      e.currentTarget.style.background = '#fafafa';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '0.25rem',
                    }}>
                      {user.name || '(No name)'}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                    }}>
                      {user.email || '(No email)'}
                    </div>
                  </div>
                  {state.selectedUser?.id === user.id && (
                    <span style={{
                      color: '#667eea',
                      fontSize: '1.2rem',
                    }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create User Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '1.5rem',
            }}>
              Create New User
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={newUserName}
                  onChange={(e) => {
                    setNewUserName(e.target.value);
                    // Clear validation error when user types
                    if (state.validationErrors.name) {
                      ploc.changeState({
                        ...ploc.state,
                        validationErrors: { ...ploc.state.validationErrors, name: '' },
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    border: state.validationErrors.name 
                      ? '2px solid #ff6b6b' 
                      : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = state.validationErrors.name ? '#ff6b6b' : '#667eea';
                    e.currentTarget.style.boxShadow = state.validationErrors.name
                      ? '0 0 0 3px rgba(255, 107, 107, 0.1)'
                      : '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = state.validationErrors.name ? '#ff6b6b' : '#e0e0e0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {state.validationErrors.name && (
                  <div style={{
                    marginTop: '0.5rem',
                    color: '#ff6b6b',
                    fontSize: '0.85rem',
                  }}>
                    {state.validationErrors.name}
                  </div>
                )}
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter user email"
                  value={newUserEmail}
                  onChange={(e) => {
                    setNewUserEmail(e.target.value);
                    // Clear validation error when user types
                    if (state.validationErrors.email) {
                      ploc.changeState({
                        ...ploc.state,
                        validationErrors: { ...ploc.state.validationErrors, email: '' },
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    border: state.validationErrors.email 
                      ? '2px solid #ff6b6b' 
                      : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = state.validationErrors.email ? '#ff6b6b' : '#667eea';
                    e.currentTarget.style.boxShadow = state.validationErrors.email
                      ? '0 0 0 3px rgba(255, 107, 107, 0.1)'
                      : '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = state.validationErrors.email ? '#ff6b6b' : '#e0e0e0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {state.validationErrors.email && (
                  <div style={{
                    marginTop: '0.5rem',
                    color: '#ff6b6b',
                    fontSize: '0.85rem',
                  }}>
                    {state.validationErrors.email}
                  </div>
                )}
              </div>
              <button
                onClick={handleCreateUser}
                disabled={isCreating || !newUserName.trim() || !newUserEmail.trim()}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  background: isCreating || !newUserName.trim() || !newUserEmail.trim()
                    ? '#ccc'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isCreating || !newUserName.trim() || !newUserEmail.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '0.5rem',
                  boxShadow: isCreating || !newUserName.trim() || !newUserEmail.trim()
                    ? 'none'
                    : '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!isCreating && newUserName.trim() && newUserEmail.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCreating && newUserName.trim() && newUserEmail.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {isCreating ? '⏳ Creating...' : '➕ Create User'}
              </button>
            </div>
          </div>
        </div>

        {/* Selected User Card */}
        {state.selectedUser && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                margin: 0,
              }}>
                Selected User
              </h3>
              <button 
                onClick={handleClearSelection}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#666',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
              >
                Clear Selection
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginBottom: '0.5rem',
                }}>ID</div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#333',
                }}>{state.selectedUser.id}</div>
              </div>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginBottom: '0.5rem',
                }}>Name</div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#333',
                }}>{state.selectedUser.name}</div>
              </div>
              <div style={{
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  marginBottom: '0.5rem',
                }}>Email</div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#333',
                }}>{state.selectedUser.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            🔍 State Debug Info
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            fontSize: '0.9rem',
          }}>
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
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </div>
  );
}
