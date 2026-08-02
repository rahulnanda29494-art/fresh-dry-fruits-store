import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'fdf_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  // Validate the stored token is still good on load; silently log out if not.
  useEffect(() => {
    if (!auth?.token) return;
    api.me(auth.token).catch(() => setAuth(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signup(name, email, password) {
    const data = await api.signup({ name, email, password });
    setAuth(data);
    return data.user;
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    setAuth(data);
    return data.user;
  }

  function logout() {
    setAuth(null);
  }

  // Replaces the stored session after a profile update returns a fresh
  // token + user (name/email may have changed).
  function applyAuth(data) {
    setAuth(data);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user: auth?.user || null, token: auth?.token || null, signup, login, logout, applyAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
