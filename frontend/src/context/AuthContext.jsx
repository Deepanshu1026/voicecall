import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, employeeAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authType, setAuthType] = useState(null);

  const initAuth = useCallback(async () => {
    const employeeAccessToken = localStorage.getItem('employeeAccessToken');
    const userAccessToken = localStorage.getItem('accessToken');

    if (employeeAccessToken) {
      try {
        const res = await employeeAPI.getMe();
        const employeeData = res.data.data.employee;
        setUser(employeeData);
        setIsAuthenticated(true);
        setAuthType('employee');
        connectSocket(employeeAccessToken);
      } catch (error) {
        console.error('Employee auth init failed:', error);
        localStorage.removeItem('employeeAccessToken');
        localStorage.removeItem('employeeRefreshToken');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (userAccessToken) {
      try {
        const res = await authAPI.getMe();
        const userData = res.data.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        setAuthType('user');
        connectSocket(userAccessToken);
      } catch (error) {
        console.error('Auth init failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(false);
    connectSocket();
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.removeItem('employeeAccessToken');
    localStorage.removeItem('employeeRefreshToken');
    setUser(userData);
    setIsAuthenticated(true);
    setAuthType('user');
    connectSocket(accessToken);
    return userData;
  };

  const employeeLogin = async (email, password) => {
    const res = await employeeAPI.login({ email, password });
    const { employee: employeeData, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('employeeAccessToken', accessToken);
    localStorage.setItem('employeeRefreshToken', refreshToken);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(employeeData);
    setIsAuthenticated(true);
    setAuthType('employee');
    connectSocket(accessToken);
    return employeeData;
  };

  const register = async (username, email, password, displayName, role = 'user') => {
    const res = await authAPI.register({ username, email, password, displayName, role });
    const { user: userData, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.removeItem('employeeAccessToken');
    localStorage.removeItem('employeeRefreshToken');
    setUser(userData);
    setIsAuthenticated(true);
    setAuthType('user');
    connectSocket(accessToken);
    return userData;
  };

  const employeeRegister = async (data) => {
    const res = await employeeAPI.register(data);
    const { employee: employeeData, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('employeeAccessToken', accessToken);
    localStorage.setItem('employeeRefreshToken', refreshToken);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(employeeData);
    setIsAuthenticated(true);
    setAuthType('employee');
    connectSocket(accessToken);
    return employeeData;
  };

  const logout = async () => {
    try {
      if (authType === 'employee') {
        await employeeAPI.logout();
      } else {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    disconnectSocket();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('employeeAccessToken');
    localStorage.removeItem('employeeRefreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setAuthType(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    authType,
    login,
    employeeLogin,
    register,
    employeeRegister,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
