import { useAppSelector, useAppDispatch } from '../app/store';
import { logoutUser } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const logout = () => {
    dispatch(logoutUser());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    logout,
  };
};

export default useAuth;
