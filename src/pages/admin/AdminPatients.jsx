import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import api, { errorMessage } from '../../api';
import Loading from '../../components/Loading';

const EMPTY = { username: '', email: '', first_name: '', last_name: '', password: '', is_active: true };

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  function load() {
    api.get('patients/', { params: search ? { search } : {} })
      .then((res) => setPatients(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  function openAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(p) {
    setForm({ ...p, password: '' });
    setEditingId(p.id);
    setFormError('');
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function save(e) {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password; // blank = keep current password
    try {
      if (editingId) {
        await api.patch(`patients/${editingId}/`, data);
        setMessage('Patient account updated.');
      } else {
        await api.post('patients/', data);
        setMessage('Patient account created.');
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  async function toggleActive(p) {
    try {
      await api.patch(`patients/${p.id}/`, { is_active: !p.is_active });
      setMessage(`${p.username} ${p.is_active ? 'deactivated' : 'reactivated'}.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove() {
    try {
      await api.delete(`patients/${toDelete.id}/`);
      setMessage(`${toDelete.username} deleted.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setToDelete(null);
    }
  }

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
        <h1 className="h3 mb-0">Patient accounts</h1>
        <div className="d-flex gap-2">
          <Form.Control placeholder="Search patients" value={search}
                        onChange={(e) => setSearch(e.target.value)} />
          <Button onClick={openAdd} className="text-nowrap">+ Add patient</Button>
        </div>
      </div>
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {loading ? <Loading /> : (
        <Table responsive hover className="bg-white align-middle">
          <thead>
            <tr><th>Name</th><th>Username</th><th>Email</th><th>Appointments</th>
              <th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {patients.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted">No patients found.</td></tr>
            )}
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.first_name} {p.last_name}</td>
                <td>{p.username}</td>
                <td>{p.email}</td>
                <td>{p.appointment_count}</td>
                <td>
                  <Badge bg={p.is_active ? 'success' : 'secondary'}>
                    {p.is_active ? 'Active' : 'Deactivated'}
                  </Badge>
                </td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-2"
                          onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="outline-warning" className="me-2"
                          onClick={() => toggleActive(p)}>
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setToDelete(p)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit patient' : 'Add patient'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Row className="g-3">
              <Col sm={6}>
                <Form.Label>First name</Form.Label>
                <Form.Control name="first_name" value={form.first_name} onChange={handleChange} required />
              </Col>
              <Col sm={6}>
                <Form.Label>Last name</Form.Label>
                <Form.Control name="last_name" value={form.last_name} onChange={handleChange} required />
              </Col>
              <Col sm={12}>
                <Form.Label>Username</Form.Label>
                <Form.Control name="username" value={form.username} onChange={handleChange} required />
              </Col>
              <Col sm={12}>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
              </Col>
              <Col sm={12}>
                <Form.Label>{editingId ? 'New password (leave blank to keep)' : 'Password'}</Form.Label>
                <Form.Control type="password" name="password" value={form.password}
                              onChange={handleChange} required={!editingId} autoComplete="new-password" />
              </Col>
              <Col sm={12}>
                <Form.Check type="switch" id="patient-active" name="is_active" label="Account active"
                            checked={form.is_active} onChange={handleChange} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={!!toDelete} onHide={() => setToDelete(null)} centered>
        <Modal.Header closeButton><Modal.Title>Delete patient?</Modal.Title></Modal.Header>
        <Modal.Body>
          This permanently deletes <strong>{toDelete?.username}</strong> and all their appointments.
          Deactivating the account keeps their history instead.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminPatients;
