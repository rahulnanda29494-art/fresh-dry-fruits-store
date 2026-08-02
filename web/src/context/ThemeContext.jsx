import { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const { showToast } = useToast();

  function toggleDark() {
    setDark((prev) => {
      const next = !prev;
      showToast(next ? 'Night mode on' : 'Day mode on');
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
