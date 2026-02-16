import { Container, Paper, Typography, TextField, Button, Box } from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';

const SignUp = () => {
  const methods = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Sign Up
        </Typography>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Box sx={{ mb: 2 }}>
              <Controller
                name="userName"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="User Name"
                    fullWidth
                    margin="normal"
                  />
                )}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Controller
                name="email"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                  />
                )}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Controller
                name="password"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                  />
                )}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Controller
                name="rePassword"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Re-enter Password"
                    type="password"
                    fullWidth
                    margin="normal"
                  />
                )}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Submit
            </Button>
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};
export default SignUp;
