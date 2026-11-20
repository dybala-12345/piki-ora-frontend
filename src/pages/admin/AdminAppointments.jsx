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
import SlotPicker from '../../components/SlotPicker';
import { formatDate, formatTime, STATUS_VARIANT } from '../../format';

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({ status: 'booked', doctor: '', date: '', upcoming: 'true' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSlot, setEditSlot] = useState(null);
  const [editError, setEditError] = useState('');

  // new booking modal
  const [creating, setCreating] = useState(false);
  const [newBooking, setNewBooking] = useState({ patient_id: '', doctor: '', reason: '' });
  const [newSlot, setNewSlot] = useState(null);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    api.get('doctors/').then((res) => setDoctors(res.data)).catch(() => {});
    api.get('patients/').then((res) => setPatients(res.data)).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('appointments/', { params })
      .then((res) => setAppointments(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  function setFilter(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function openEdit(appt) {
    setEditing(appt);
    setEditForm({ status: appt.status, reason: appt.reason });
    setEditSlot(null);
    setEditError('');
  }

  async function saveEdit() {
    const changes = { ...editForm };
    if (editSlot) changes.slot = editSlot.id;
    try {
      await api.patch(`appointments/${editing.id}/`, changes);
      setMessage(`Appointment #${editing.id} updated.`);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(errorMessage(err));
    }
  }

  async function cancel(appt) {
    try {
      await api.post(`appointments/${appt.id}/cancel/`);
      setMessage(`Appointment #${appt.id} cancelled.`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function createBooking() {
    setCreateError('');
    try {
      await api.post('appointments/', {
        patient_id: newBooking.patient_id, slot: newSlot.id, reason: newBooking.reason,
      });
      setMessage('Booking created for patient.');
      setCreating(false);
      setNewBooking({ patient_id: '', doctor: '', reason: '' });
      setNewSlot(null);
      load();
    } catch (err) {
      setCreateError(errorMessage(err));
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">All patient bookings</h1>
        <Button onClick={() => { setCreating(true); setCreateError(''); }}>+ New booking</Button>
      </div>
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="g-2 mb-3">
        <Col sm={6} lg={3}>
          <Form.Select name="status" value={filters.status} onChange={setFilter}>
            <option value="">All statuses</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Col>
        <Col sm={6} lg={3}>
          <Form.Select name="doctor" value={filters.doctor} onChange={setFilter}>
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </Form.Select>
        </Col>
        <Col sm={6} lg={3}>
          <Form.Control type="date" name="date" value={filters.date} onChange={setFilter} />
        </Col>
        <Col sm={6} lg={3}>
          <Form.Select name="upcoming" value={filters.upcoming} onChange={setFilter}>
            <option value="true">Upcoming only</option>
            <option value="">Include past</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? <Loading /> : (
        <Table responsive hover className="bg-white align-middle">
          <thead>
            <tr><th>#</th><th>Date</th><th>Time</th><th>Doctor</th><th>Patient</th>
              <th>Reason</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr><td colSpan={8} className="text-muted text-center">No appointments match.</td></tr>
            )}
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td className="text-nowrap">{formatDate(a.date)}</td>
                <td>{formatTime(a.start_time)}</td>
                <td>{a.doctor_name}</td>
                <td>{a.patient_name}<div className="small text-muted">{a.patient_username}</div></td>
                <td className="small">{a.reason}</td>
                <td><Badge bg={STATUS_VARIANT[a.status]} className="text-capitalize">{a.status}</Badge></td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-2"
                          onClick={() => openEdit(a)}>Edit</Button>
                  {a.status === 'booked' && (
                    <Button size="sm" variant="outline-danger" onClick={() => cancel(a)}>Cancel</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit appointment */}
      <Modal show={!!editing} onHide={() => setEditing(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Edit appointment #{editing?.id}</Modal.Title></Modal.Header>
        {editing && (
          <Modal.Body>
            {editError && <Alert variant="danger">{editError}</Alert>}
            <p className="text-muted">
              {editing.patient_name} with {editing.doctor_name}, {formatDate(editing.date)} at{' '}
              {formatTime(editing.start_time)}
            </p>
            <Row className="g-3 mb-3">
              <Col sm={4}>
                <Form.Label>Status</Form.Label>
                <Form.Select value={editForm.status}
                             onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="booked">Booked</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Col>
              <Col sm={8}>
                <Form.Label>Reason</Form.Label>
                <Form.Control value={editForm.reason}
                              onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })} />
              </Col>
            </Row>
            <h2 className="h6">Move to another time (optional)</h2>
            <SlotPicker doctorId={editing.doctor_id} selectedSlot={editSlot}
                        onSelect={setEditSlot} currentSlotId={editing.slot} />
            {editSlot && (
              <Alert variant="info" className="mt-3 mb-0">
                New time: {formatDate(editSlot.date)} at {formatTime(editSlot.start_time)}
              </Alert>
            )}
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setEditing(null)}>Close</Button>
          <Button onClick={saveEdit}>Save changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Book on behalf of a patient (e.g. phone booking) */}
      <Modal show={creating} onHide={() => setCreating(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>New booking for a patient</Modal.Title></Modal.Header>
        <Modal.Body>
          {createError && <Alert variant="danger">{createError}</Alert>}
          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Label>Patient</Form.Label>
              <Form.Select value={newBooking.patient_id}
                           onChange={(e) => setNewBooking({ ...newBooking, patient_id: e.target.value })}>
                <option value="">Choose patient...</option>
                {patients.filter((p) => p.is_active).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.username})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={6}>
              <Form.Label>Doctor</Form.Label>
              <Form.Select value={newBooking.doctor}
                           onChange={(e) => { setNewBooking({ ...newBooking, doctor: e.target.value }); setNewSlot(null); }}>
                <option value="">Choose doctor...</option>
                {doctors.filter((d) => d.is_active).map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={12}>
              <Form.Label>Reason</Form.Label>
              <Form.Control value={newBooking.reason}
                            onChange={(e) => setNewBooking({ ...newBooking, reason: e.target.value })} />
            </Col>
          </Row>
          {newBooking.doctor && (
            <SlotPicker key={newBooking.doctor} doctorId={Number(newBooking.doctor)}
                        selectedSlot={newSlot} onSelect={setNewSlot} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setCreating(false)}>Close</Button>
          <Button onClick={createBooking} disabled={!newBooking.patient_id || !newSlot}>Book</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminAppointments;
