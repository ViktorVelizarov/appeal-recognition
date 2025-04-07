import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ImageUpload from './components/ImageUpload';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!user) {
    return (
      <div className="App">
        <div className="auth-toggle">
          <button 
            className={showLogin ? 'active' : ''} 
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
          <button 
            className={!showLogin ? 'active' : ''} 
            onClick={() => setShowLogin(false)}
          >
            Register
          </button>
        </div>
        {showLogin ? <Login /> : <Register />}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Welcome, {user.name}!</h1>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>
      <ImageUpload />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
