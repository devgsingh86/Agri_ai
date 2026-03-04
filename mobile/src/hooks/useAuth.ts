/**
 * useAuth hook — login / register / logout with Keychain token persistence.
 * On app boot, call restoreToken() to rehydrate Redux auth state.
 */
import { useCallback } from 'react';
import * as Keychain from 'react-native-keychain';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setCredentials, clearCredentials } from '../store/authSlice';
import { useLoginMutation, useRegisterMutation } from '../services/api';
import type { User } from '../types';

const KEYCHAIN_SERVICE = 'com.agriai.token';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, user, isAuthenticated } = useAppSelector((s) => s.auth);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();

  /**
   * Persist token to Keychain and update Redux state.
   */
  const persistCredentials = useCallback(
    async (newToken: string, newUser: User) => {
      await Keychain.setGenericPassword('token', newToken, {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      dispatch(setCredentials({ token: newToken, user: newUser }));
    },
    [dispatch]
  );

  /**
   * Login with email + password. Returns the token on success.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<string> => {
      const result = await loginMutation({ email, password }).unwrap();
      await persistCredentials(result.data.token, result.data.user);
      return result.data.token;
    },
    [loginMutation, persistCredentials]
  );

  /**
   * Register a new account and auto-login.
   */
  const register = useCallback(
    async (email: string, password: string): Promise<string> => {
      const result = await registerMutation({ email, password }).unwrap();
      await persistCredentials(result.data.token, result.data.user);
      return result.data.token;
    },
    [registerMutation, persistCredentials]
  );

  /**
   * Logout — clear Keychain + Redux state.
   */
  const logout = useCallback(async () => {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    dispatch(clearCredentials());
  }, [dispatch]);

  /**
   * Called on app startup to restore a saved token from Keychain.
   * Returns true if a valid token was found and rehydrated.
   */
  const restoreToken = useCallback(async (): Promise<boolean> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE,
      });
      if (credentials && credentials.password) {
        // We only have the raw token — user details are re-fetched by the
        // caller (RootNavigator) via getProfile once authenticated.
        dispatch(
          setCredentials({
            token: credentials.password,
            user: { id: '', email: '' }, // placeholder; profile screen fetches full data
          })
        );
        return true;
      }
    } catch {
      // Keychain unavailable on this device — continue unauthenticated
    }
    return false;
  }, [dispatch]);

  return {
    token,
    user,
    isAuthenticated,
    isLoginLoading,
    isRegisterLoading,
    login,
    register,
    logout,
    restoreToken,
  };
}
