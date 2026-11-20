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

const EMPTY = { first_name: '', last_name: '', specialisation: 'General Practitioner',
  email: '', phone: '', bio: '', is_active: true };

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  function load() {
    api.get('doctors/')
      .then((res) => setDoctors(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(doctor) {
    setForm({ ...doctor });
    setEditingId(doctor.id);
    setFormError('');
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function save(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`doctors/${editingId}/`, form);
        setMessage('Doctor updated.');
      } else {
        await api.post('doctors/', form);
        setMessage('Doctor added.');
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  async function remove() {
    try {
      await api.delete(`doctors/${toDelete.id}/`);
      setMessage(`${toDelete.full_name} removed.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setToDelete(null);
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Doctors</h1>
        <Button onClick={openAdd}>+ Add doctor</Button>
      </div>
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Loading /> : (
        <Table responsive hover className="bg-white align-middle">
          <thead>
            <tr><th>Name</th><th>Specialisation</th><th>Contact</th><th>Open slots</th>
              <th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td>{d.full_name}</td>
                <td>{d.specialisation}</td>
                <td className="small">{d.email}<br />{d.phone}</td>
                <td>{d.upcoming_available_slots}</td>
                <td>
                  <Badge bg={d.is_active ? 'success' : 'secondary'}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-2"
                          onClick={() => openEdit(d)}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setToDelete(d)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add / edit doctor form */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" centered>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit doctor' : 'Add doctor'}</Modal.Title>
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
              <Col sm={6}>
                <Form.Label>Specialisation</Form.Label>
                <Form.Control name="specialisation" value={form.specialisation} onChange={handleChange} required />
              </Col>
              <Col sm={6}>
                <Form.Label>Phone</Form.Label>
                <Form.Control name="phone" value={form.phone} onChange={handleChange} />
              </Col>
              <Col sm={12}>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
              </Col>
              <Col sm={12}>
                <Form.Label>Bio</Form.Label>
                <Form.Control as="textarea" rows={3} name="bio" value={form.bio} onChange={handleChange} />
              </Col>
              <Col sm={12}>
                <Form.Check type="switch" id="is_active" name="is_active" label="Active (visible to patients)"
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
        <Modal.Header closeButton><Modal.Title>Remove doctor?</Modal.Title></Modal.Header>
        <Modal.Body>
          This permanently deletes {toDelete?.full_name} and all of their slots and appointments.
          To keep the history, edit the doctor and switch them to inactive instead.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={remove}>Remove</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminDoctors;
