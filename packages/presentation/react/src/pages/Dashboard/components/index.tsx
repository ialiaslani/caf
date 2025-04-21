import { FsButton } from '@fs/core';
import { Box } from '@mui/material';
import { useLogout } from '../hook/useLogout';

const Dashboard = () => {
  const { logout } = useLogout();

  return (
    <Box p={4}>
      <FsButton onClick={logout}>logout</FsButton>
    </Box>
  );
};

export default Dashboard;
