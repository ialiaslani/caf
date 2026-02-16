import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const SignUp = lazy(() => import('./components'));

const SignUpRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
    </Routes>
  );
};
export default SignUpRoutes;

export const counterMenu: any = [
  {
    path: '/signup',
    intlMessageId: `sidebar.signup`,
    icon: <HomeOutlinedIcon />,
  },
];
