import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

const EMPTY = { first_name: '', last_name: '', email: '', username: '', password: '', confirm: '' };

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // one handler for every input, using the input's "name"
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const { confirm, ...details } = form;
      await register(details);
      navigate('/doctors');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="auth-card auth-card-wide shadow-sm border-0 mx-auto">
      <Card.Body className="p-4">
        <h1 className="h3 mb-3">Create a patient account</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col sm={6}>
              <Form.Label htmlFor="first_name">First name</Form.Label>
              <Form.Control id="first_name" name="first_name" value={form.first_name}
                            onChange={handleChange} required />
            </Col>
            <Col sm={6}>
              <Form.Label htmlFor="last_name">Last name</Form.Label>
              <Form.Control id="last_name" name="last_name" value={form.last_name}
                            onChange={handleChange} required />
            </Col>
            <Col sm={12}>
              <Form.Label htmlFor="email">Email</Form.Label>
              <Form.Control id="email" type="email" name="email" value={form.email}
                            onChange={handleChange} required />
            </Col>
            <Col sm={12}>
              <Form.Label htmlFor="username">Username</Form.Label>
              <Form.Control id="username" name="username" value={form.username}
                            onChange={handleChange} autoComplete="username" required />
            </Col>
            <Col sm={6}>
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control id="password" type="password" name="password" value={form.password}
                            onChange={handleChange} autoComplete="new-password" required />
              <Form.Text>At least 8 characters, not too common.</Form.Text>
            </Col>
            <Col sm={6}>
              <Form.Label htmlFor="confirm">Confirm password</Form.Label>
              <Form.Control id="confirm" type="password" name="confirm" value={form.confirm}
                            onChange={handleChange} autoComplete="new-password" required />
            </Col>
          </Row>
          <Button type="submit" className="w-100 mt-4" disabled={busy}>
            {busy ? 'Creating account...' : 'Register'}
          </Button>
        </Form>
        <p className="mt-3 mb-0 text-center small">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </Card.Body>
    </Card>
  );
}

export default Register;
