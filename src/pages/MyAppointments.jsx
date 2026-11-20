import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import api, { errorMessage } from '../api';
import Loading from '../components/Loading';
import { formatDate, formatTime, STATUS_VARIANT, todayISO } from '../format';

function AppointmentCard({ appt, onCancel }) {
  const editable = appt.status === 'booked' && appt.date >= todayISO();
  return (
    <Card className="mb-3 shadow-sm border-0">
      <Card.Body className="d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <strong>{formatDate(appt.date)}</strong>
            <span>{formatTime(appt.start_time)} – {formatTime(appt.end_time)}</span>
            <Badge bg={STATUS_VARIANT[appt.status]} className="text-capitalize">{appt.status}</Badge>
          </div>
          <div>{appt.doctor_name}</div>
          {appt.reason && <div className="text-muted small">Reason: {appt.reason}</div>}
          <div className="text-muted small">Ref #{appt.id}</div>
        </div>
        {editable && (
          <div className="d-flex gap-2 align-items-start">
            <Button as={Link} to={`/my-appointments/${appt.id}/edit`} size="sm"
                    variant="outline-primary">Edit</Button>
            <Button size="sm" variant="outline-danger" onClick={() => onCancel(appt)}>Cancel</Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [toCancel, setToCancel] = useState(null);

  function load() {
    api.get('appointments/')
      .then((res) => setAppointments(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function confirmCancel() {
    try {
      await api.post(`appointments/${toCancel.id}/cancel/`);
      setMessage('Your appointment has been cancelled.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setToCancel(null);
    }
  }

  const today = todayISO();
  const upcoming = appointments.filter((a) => a.status === 'booked' && a.date >= today);
  const history = appointments.filter((a) => !(a.status === 'booked' && a.date >= today)).reverse();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">My appointments</h1>
        <Button as={Link} to="/doctors">+ Book new</Button>
      </div>
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Loading /> : (
        <Tabs defaultActiveKey="upcoming" className="mb-3">
          <Tab eventKey="upcoming" title={`Upcoming (${upcoming.length})`}>
            {upcoming.length === 0 && (
              <p className="text-muted">You have no upcoming appointments.</p>
            )}
            {upcoming.map((a) => <AppointmentCard key={a.id} appt={a} onCancel={setToCancel} />)}
          </Tab>
          <Tab eventKey="history" title={`Past & cancelled (${history.length})`}>
            {history.length === 0 && <p className="text-muted">Nothing here yet.</p>}
            {history.map((a) => <AppointmentCard key={a.id} appt={a} onCancel={setToCancel} />)}
          </Tab>
        </Tabs>
      )}

      <Modal show={!!toCancel} onHide={() => setToCancel(null)} centered>
        <Modal.Header closeButton><Modal.Title>Cancel appointment?</Modal.Title></Modal.Header>
        {toCancel && (
          <Modal.Body>
            {toCancel.doctor_name} on {formatDate(toCancel.date)} at {formatTime(toCancel.start_time)}.
            The time will be released for other patients.
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setToCancel(null)}>Keep it</Button>
          <Button variant="danger" onClick={confirmCancel}>Yes, cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MyAppointments;
