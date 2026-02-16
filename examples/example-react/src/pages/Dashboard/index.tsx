import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { addTranslationSchema } from 'src/i18nConfig';
import authTranslations from './i18n/fa.json';
import { PageProvider } from '@fs/utils';

const Dashboard = lazy(() => import('./components'));

const DashboardRoutes = () => {
  addTranslationSchema('fa', authTranslations);
  // const { instance } = getInstance()
  // const counterServices = counterService(instance)
  return (
    <PageProvider entityName="dashboard" httpService={[]}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </PageProvider>
  );
};

export default DashboardRoutes;
