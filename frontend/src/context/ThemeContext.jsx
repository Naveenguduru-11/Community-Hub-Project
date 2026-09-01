import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Dark mode removed — app is permanently light-only
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Remove any previously stored dark preference and force light
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
