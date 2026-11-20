import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(username, password);
      // go back to the page they wanted, or to their home area
      navigate(location.state?.from || (user.is_admin ? '/admin' : '/my-appointments'));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="auth-card shadow-sm border-0 mx-auto">
      <Card.Body className="p-4">
        <h1 className="h3 mb-3">Log in</h1>
        {location.state?.from && (
          <Alert variant="info">Please log in to continue.</Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control value={username} onChange={(e) => setUsername(e.target.value)}
                          autoComplete="username" required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password" required />
          </Form.Group>
          <Button type="submit" className="w-100" disabled={busy}>
            {busy ? 'Logging in...' : 'Log in'}
          </Button>
        </Form>
        <p className="mt-3 mb-0 text-center small">
          New patient? <Link to="/register">Create an account</Link>
        </p>
      </Card.Body>
    </Card>
  );
}

export default Login;
