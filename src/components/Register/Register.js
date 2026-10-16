import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth';
import './Register.css';

const Register = () => {
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
      login(await api('/auth/register', { method: 'POST', body: { username, password } }));
      history.replace(location.state?.from || '/auctions');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="register">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username (letters, numbers, _)"
          autoComplete="username"
          required
          minLength={3}
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (at least 6 characters)"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Register'}</button>
      </form>
      <p className="form-footer">
        Already registered? <Link to={{ pathname: '/login', state: location.state }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;
