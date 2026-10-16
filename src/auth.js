import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from './api';

const STORAGE_KEY = 'aucsol.session';
const AuthContext = createContext(null);

function tokenExpiry(token) {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(payload)).exp * 1000;
}

function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (session && tokenExpiry(session.token) > Date.now()) return session;
  } catch (err) {
    // Missing or corrupt session; treat as logged out.
  }
  return null;
}

function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // Storage unavailable (e.g. private mode); the session lasts until reload.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const login = useCallback((newSession) => {
    saveSession(newSession);
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  // Calls the API with the current token and logs out if the server rejects it.
  const request = useCallback(
    async (path, options = {}) => {
      try {
        return await api(path, { ...options, token: session?.token });
      } catch (err) {
        if (err.status === 401 && session) logout();
        throw err;
      }
    },
    [session, logout]
  );

  const value = useMemo(
    () => ({ user: session?.username ?? null, login, logout, request }),
    [session, login, logout, request]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
