import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth';
import { paddleNumber } from '../../utils';
import Paddle from '../Paddle/Paddle';
import './AuthPage.css';

const MODES = {
  login: {
    title: 'Log in',
    endpoint: '/auth/login',
    submit: 'Log in',
    submitting: 'Logging in…',
    passwordAutocomplete: 'current-password',
    paddleText: 'Your paddle number. It appears next to every bid you place.',
    switchText: 'No account yet?',
    switchLink: 'Create one',
    switchPath: '/register',
  },
  register: {
    title: 'Create an account',
    endpoint: '/auth/register',
    submit: 'Create account',
    submitting: 'Creating account…',
    passwordAutocomplete: 'new-password',
    paddleText: 'This is your paddle number. It appears next to every bid you place.',
    switchText: 'Already have an account?',
    switchLink: 'Log in',
    switchPath: '/login',
  },
};

const AuthPage = ({ mode }) => {
  const copy = MODES[mode];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const normalized = username.trim().toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      login(await api(copy.endpoint, { method: 'POST', body: { username, password } }));
      history.replace(location.state?.from || '/auctions');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-panel">
        <div className="auth-paddle on-dark" aria-hidden="true">
          <Paddle size="large" number={normalized ? paddleNumber(normalized) : '?'} />
          <p>{normalized ? copy.paddleText : 'Type a username to see your paddle number.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>{copy.title}</h1>
          <label className="field">
            <span className="field-label">Username</span>
            <input
              className="input"
              type="text"
              autoComplete="username"
              required
              minLength={mode === 'register' ? 3 : undefined}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {mode === 'register' && <span className="field-hint">3–30 letters, numbers or underscores.</span>}
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete={copy.passwordAutocomplete}
              required
              minLength={mode === 'register' ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'register' && <span className="field-hint">At least 6 characters.</span>}
          </label>
          {error && <p className="error form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? copy.submitting : copy.submit}
          </button>
          <p className="auth-switch">
            {copy.switchText}{' '}
            <Link to={{ pathname: copy.switchPath, state: location.state }}>{copy.switchLink}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
