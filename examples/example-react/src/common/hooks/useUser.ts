import { UserApi } from '@caf/example-infrastructure';

export const useUser = () => {
  const userApi = new UserApi();

  const getUsers = () => {
    return userApi.getUsers();
  };

  return {
    getUsers,
  };
};
