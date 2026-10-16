import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      login(await api('/auth/login', { method: 'POST', body: { username, password } }));
      history.replace(location.state?.from || '/auctions');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Logging in…' : 'Login'}</button>
      </form>
      <p className="form-footer">
        No account? <Link to={{ pathname: '/register', state: location.state }}>Register</Link>
      </p>
    </div>
  );
};

export default Login;
