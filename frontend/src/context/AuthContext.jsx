import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('communityhub_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2500);

    if (token) {
      authService.getMe()
        .then(res => {
          if (isMounted) setUser(res.data.user);
        })
        .catch(err => {
          console.error('Session restore failed:', err);
          if (isMounted) logout();
        })
        .finally(() => {
          if (isMounted) setLoading(false);
          clearTimeout(timer);
        });
    } else {
      setLoading(false);
      clearTimeout(timer);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('communityhub_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('communityhub_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('communityhub_token');
    setToken(null);
    setUser(null);
  };

  // Quick Demo Login Switcher Helper
  const loginAsDemoRole = async (role) => {
    const credentialsMap = {
      SUPER_ADMIN: { email: 'superadmin@communityhub.com', password: 'password123' },
      COMMUNITY_ADMIN: { email: 'admin@greenfield.com', password: 'password123' },
      RESIDENT: { email: 'resident@greenfield.com', password: 'password123' },
      SECURITY_GUARD: { email: 'guard@greenfield.com', password: 'password123' }
    };

    const creds = credentialsMap[role];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      loginAsDemoRole,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
