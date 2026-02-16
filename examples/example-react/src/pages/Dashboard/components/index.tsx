import { Button, Box } from '@mui/material';
import { useLogout } from '../hook/useLogout';

const Dashboard = () => {
  const { logout } = useLogout();

  return (
    <Box p={4}>
      <Button onClick={logout} variant="contained" color="primary">
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;
