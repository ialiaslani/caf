import { useRouteManager } from '@c-a-f/infrastructure-react';
import { useLocation } from 'react-router-dom';
import { Button } from './ui';

/**
 * Navigation component demonstrating RouteManager usage from @c-a-f/core
 * Uses useRouteManager hook from @c-a-f/infrastructure-react
 */
export function Navigation() {
  const routeManager = useRouteManager();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    routeManager.changeRoute(path);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Button
        onClick={() => handleNavigate('/')}
        variant={location.pathname === '/' ? 'primary' : 'secondary'}
        style={{
          fontWeight: location.pathname === '/' ? '600' : '400',
        }}
      >
        🏠 User Management
      </Button>
      <Button
        onClick={() => handleNavigate('/patterns')}
        variant={location.pathname === '/patterns' ? 'primary' : 'secondary'}
        style={{
          fontWeight: location.pathname === '/patterns' ? '600' : '400',
        }}
      >
        📋 Patterns
      </Button>
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          color: '#666',
        }}
      >
        <span>Current Route:</span>
        <code
          style={{
            padding: '0.25rem 0.5rem',
            background: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          {location.pathname}
        </code>
      </div>
    </nav>
  );
}
