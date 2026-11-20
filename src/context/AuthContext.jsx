import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

// Shares "who is logged in" with every component, so we don't have to
// pass the user down as props through every page.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [checking, setChecking] = useState(!!localStorage.getItem('token'));

  // On page load, confirm the saved token still works
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('me/')
      .then((res) => saveUser(res.data))
      .catch(() => clearSession())
      .finally(() => setChecking(false));
  }, []);

  function saveUser(u) {
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }

  function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  async function login(username, password) {
    const res = await api.post('login/', { username, password });
    localStorage.setItem('token', res.data.token);
    saveUser(res.data.user);
    return res.data.user;
  }

  async function register(details) {
    const res = await api.post('register/', details);
    localStorage.setItem('token', res.data.token);
    saveUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await api.post('logout/');
    } finally {
      clearSession();
    }
  }

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
