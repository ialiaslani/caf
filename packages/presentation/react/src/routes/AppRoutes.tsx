import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useRouteManager } from 'src/common/hooks/useRouterManager';
import DashboardRoutes from 'src/pages/Dashboard';

const SignUpRoutes = lazy(() => import('src/pages/Signup'));
const LoginRoutes = lazy(() => import('src/pages/Login'));
const HomeRoutes = lazy(() => import('src/pages/Home'));
const NotFoundPage = lazy(
  () => import('src/common/components/NotFoundPage/NotFoundPage')
);
const ErrorPage = lazy(() => import('src/pages/error'));

const AppRoutes = () => {
  const { init } = useRouteManager();

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      {(() => {
        return (
          <Suspense
            fallback={
              <Box
                sx={{ height: '100vh' }}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                Loading <CircularProgress sx={{ margin: '0px 10px' }} />
              </Box>
            }
          >
            <Routes>
              <Route path="404" element={<NotFoundPage message="404Msg" />} />
              <Route path="403" element={<NotFoundPage message="403Msg" />} />
              <Route path="login/*" element={<LoginRoutes />} />
              <Route path="signUp/*" element={<SignUpRoutes />} />
              <Route path="/dashboard" element={<DashboardRoutes />} />
              <Route path="*" element={<HomeRoutes />} />
            </Routes>
            <Routes>
              <Route
                path="/"
                element={<></>}
                errorElement={<ErrorPage />}
              ></Route>
            </Routes>
          </Suspense>
        );
      })()}
    </>
  );
};

export default AppRoutes;
