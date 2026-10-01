import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MIN_PASSWORD_LENGTH = 6;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <header className="auth-top">
        <Link className="logo" to="/" aria-label="StyleStealer home">
          <span>
            Style
            <br />
            Stealer
          </span>
        </Link>
      </header>

      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <h1 className="mega">
              Create&nbsp;an
              <br />
              account
              <b>.</b>
            </h1>
            <p className="auth-sub">Sign up to get three free scans. No card required.</p>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="auth-fields">
            <div className="field">
              <label htmlFor="register-name">Name</label>
              <input
                id="register-name"
                type="text"
                placeholder="Jane Appleseed"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn auth-cta" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'} <span className="btn-arrow" aria-hidden="true">&#8599;</span>
          </button>

          <p className="auth-alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </main>
    </>
  );
};

export default Register;
