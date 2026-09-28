import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const THEME_KEY = 'stylestealer-theme';

// The logged-in app defaults to dark; a saved 'light' choice is the only override.
const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(readTheme);
  const isDark = theme === 'dark';

  // Mirror the theme onto <html> so the page background, overscroll and
  // scrollbar follow it; removed on unmount so public pages stay black.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.appTheme = theme;
    return () => {
      delete root.dataset.appTheme;
    };
  }, [theme]);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable: the choice just lasts for this session */
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`surface ${isDark ? 'surface--ink' : 'surface--bone'}`}>
      <header className="app-top">
        <Link className="logo" to="/app" aria-label="StyleStealer home">
          <span>
            Style
            <br />
            Stealer
          </span>
        </Link>
        <nav className="app-nav" aria-label="Account">
          <NavLink to="/app" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Upload
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            History
          </NavLink>
          <span className="app-user">{user?.email}</span>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            className="theme-switch"
            onClick={toggleTheme}
          >
            <span className="mono">Dark</span>
            <span className="theme-switch-track" aria-hidden="true">
              <span className="theme-switch-thumb" />
            </span>
          </button>
          <button type="button" className="btn btn--sm btn--ghost" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
