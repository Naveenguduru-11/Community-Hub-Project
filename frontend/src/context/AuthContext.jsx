import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

// ─────────────────────────────────────────────────────────────────────────────
// We intentionally use sessionStorage (not localStorage) so that each browser
// tab maintains its OWN independent login session.
//
// localStorage  → shared across ALL tabs of the same origin  ❌
// sessionStorage → isolated per-tab, cleared when tab closes  ✅
//
// This means you can log in as 4 different users in 4 separate tabs, and
// refreshing one tab will NOT affect the others.
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'communityhub_token';

const storage = {
  get: ()       => sessionStorage.getItem(STORAGE_KEY),
  set: (token)  => sessionStorage.setItem(STORAGE_KEY, token),
  clear: ()     => sessionStorage.removeItem(STORAGE_KEY),
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(storage.get() || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    if (token) {
      authService.getMe()
        .then(res => {
          if (isMounted) setUser(res.data.user);
        })
        .catch(err => {
          // Only force-logout on explicit 401 (bad/expired token)
          // Do NOT logout on network errors, 500s, or DB hiccups
          const status = err.response?.status;
          if (status === 401) {
            console.warn('Token invalid or expired — logging out');
            if (isMounted) logout();
          } else {
            console.warn('Session restore failed (non-401), keeping token:', err.message);
          }
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
    storage.set(newToken);        // tab-isolated write
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const { token: newToken, user: userData } = res.data;
    storage.set(newToken);        // tab-isolated write
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    storage.clear();              // only clears THIS tab's token
    setToken(null);
    setUser(null);
  };

  // Quick Demo Login Switcher Helper
  const loginAsDemoRole = async (role) => {
    const credentialsMap = {
      SUPER_ADMIN:    { email: 'superadmin@communityhub.com', password: 'password123' },
      COMMUNITY_ADMIN:{ email: 'admin@greenfield.com',        password: 'password123' },
      RESIDENT:       { email: 'resident@greenfield.com',     password: 'password123' },
      SECURITY_GUARD: { email: 'guard@greenfield.com',        password: 'password123' }
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
