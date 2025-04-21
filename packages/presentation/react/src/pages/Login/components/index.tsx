import { Container, Paper, Typography } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { FsInput } from '@fs/form';
import { FsButton } from '@fs/core';
import { useLogin } from '../hook/useLogin';

const LogIn = () => {
  const methods = useForm();
  const { login } = useLogin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    login(data);
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
          Log In
        </Typography>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <FsInput name="UserName" i18nKey={'UserName'} />
            <FsInput name="password" i18nKey={'password'} />
            <FsButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              i18nKey="settings"
            />
          </form>
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default LogIn;
