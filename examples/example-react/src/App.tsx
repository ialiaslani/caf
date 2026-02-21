import { useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useCAFDevTools, CAFProvider } from '@c-a-f/infrastructure-react';
import { createMemoryLeakDetector, createPerformanceProfiler } from '@c-a-f/devtools/core';
import { DevToolsLogger, LogLevel } from '@c-a-f/devtools/logger';
import { StateInspector } from '@c-a-f/devtools/inspector';
import { Navigation } from './components/Navigation';
import { UserManagement } from './components/UserManagement';
import { PatternsPage } from './components/PatternsPage';
import { setupUserPloc } from '../caf/setup';
import { ZodValidator } from '@c-a-f/validation/zod';
import { UserService } from '../caf/domain';
import { CreateUser } from '../caf/application';
import { MockUserRepository } from '../caf/infrastructure/api/User/MockUserRepository';
import { CreateUserSchema } from '../caf/infrastructure/validation';
import './App.css';

function App() {
  // Create UserPloc and CreateUser use case for CAFProvider
  const userPloc = useMemo(() => setupUserPloc(), []);
  
  const createUserUseCase = useMemo(() => {
    const userRepository = new MockUserRepository();
    const userService = new UserService(userRepository);
    const createUserValidator = new ZodValidator(CreateUserSchema);
    return new CreateUser(createUserValidator, userService);
  }, []);

  // Initialize CAF DevTools for debugging
  // Initialize CAF DevTools for debugging
  const devTools = useCAFDevTools({ 
    enabled: import.meta.env.DEV // Enable in development mode
  });

  // Enhanced DevTools setup
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // Create logger
    const logger = new DevToolsLogger({
      level: LogLevel.DEBUG,
      enabled: true,
      includeTimestamp: true,
      includeLevel: true,
    });

    // Create memory leak detector
    const leakDetector = createMemoryLeakDetector({
      enabled: true,
      warnThreshold: 10000, // 10 seconds
      errorThreshold: 60000, // 60 seconds
      checkInterval: 5000, // Check every 5 seconds
    });

    // Create performance profiler
    const profiler = createPerformanceProfiler({
      enabled: true,
      trackSlowOperations: true,
      slowThreshold: 100, // 100ms
    });

    // Create state inspector
    const inspector = new StateInspector();

    // Store in window for global access
    (window as any).__CAF_DEVTOOLS_ENHANCED__ = {
      logger,
      leakDetector,
      profiler,
      inspector,
    };

    logger.info('CAF Enhanced DevTools initialized', {
      logger: 'enabled',
      leakDetector: 'enabled',
      profiler: 'enabled',
      inspector: 'enabled',
    });

    return () => {
      leakDetector.cleanup();
      profiler.clear();
    };
  }, []);

  return (
    <CAFProvider 
      plocs={{ user: userPloc }}
      useCases={{ createUser: createUserUseCase }}
    >
      <Navigation />
      <div style={{ paddingTop: '70px' }}>
        <Routes>
          <Route path="/" element={<UserManagement />} />
          <Route path="/patterns" element={<PatternsPage />} />
        </Routes>
      </div>
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '0.5rem 1rem',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>CAF DevTools:</span>
          <button
            onClick={() => devTools.enabled ? devTools.disable() : devTools.enable()}
            style={{
              padding: '0.25rem 0.75rem',
              background: devTools.enabled ? '#4caf50' : '#666',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            {devTools.enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      )}
    </CAFProvider>
  )
}

export default App
