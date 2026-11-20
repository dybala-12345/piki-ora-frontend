import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import api, { errorMessage } from '../api';
import Loading from '../components/Loading';
import SlotPicker from '../components/SlotPicker';
import { formatDate, formatTime } from '../format';

// Patient edits an appointment: change the reason and/or move to another time
function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [reason, setReason] = useState('');
  const [newSlot, setNewSlot] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`appointments/${id}/`)
      .then((res) => {
        setAppt(res.data);
        setReason(res.data.reason);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  async function save() {
    setBusy(true);
    setError('');
    const changes = { reason };
    if (newSlot) changes.slot = newSlot.id;   // only send the slot if it changed
    try {
      await api.patch(`appointments/${id}/`, changes);
      navigate('/my-appointments');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (error && !appt) return <Alert variant="danger">{error}</Alert>;
  if (!appt) return <Loading />;

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Link to="/my-appointments" className="small">‹ My appointments</Link>
        <h1 className="h4 mt-2">Edit appointment #{appt.id}</h1>
        <p className="text-muted">
          Currently: {appt.doctor_name}, {formatDate(appt.date)} at {formatTime(appt.start_time)}
        </p>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-4" controlId="reason">
          <Form.Label>Reason for visit</Form.Label>
          <Form.Control value={reason} maxLength={255} onChange={(e) => setReason(e.target.value)} />
        </Form.Group>

        <h2 className="h6">Change time (optional)</h2>
        <SlotPicker doctorId={appt.doctor_id} selectedSlot={newSlot}
                    onSelect={setNewSlot} currentSlotId={appt.slot} />
        {newSlot && (
          <Alert variant="info" className="mt-3">
            New time: <strong>{formatDate(newSlot.date)}</strong> at{' '}
            <strong>{formatTime(newSlot.start_time)}</strong>{' '}
            <Button size="sm" variant="link" onClick={() => setNewSlot(null)}>keep original time</Button>
          </Alert>
        )}

        <div className="d-flex gap-2 mt-4">
          <Button onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</Button>
          <Button variant="outline-secondary" as={Link} to="/my-appointments">Back</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default EditAppointment;
