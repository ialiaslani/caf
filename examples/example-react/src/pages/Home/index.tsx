import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('./components'));

const HomeRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default HomeRoutes;

export const counterMenu: any = [
  {
    path: '/login',
    intlMessageId: `sidebar.counter`,
    icon: <HomeOutlinedIcon />,
  },
];
