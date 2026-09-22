import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="surface--bone">
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
