import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import api, { errorMessage } from '../api';
import Loading from '../components/Loading';
import SlotPicker from '../components/SlotPicker';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../format';

function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [pickerKey, setPickerKey] = useState(0); // used to reload the slot list

  useEffect(() => {
    api.get(`doctors/${id}/`)
      .then((res) => setDoctor(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  async function book() {
    setBusy(true);
    setBookingError('');
    try {
      const res = await api.post('appointments/', { slot: selectedSlot.id, reason });
      setConfirmed(res.data);           // shows the confirmation pop-up
      setSelectedSlot(null);
      setReason('');
    } catch (err) {
      setBookingError(errorMessage(err));
      setPickerKey(pickerKey + 1);       // slot may have just been taken - refresh list
      setSelectedSlot(null);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!doctor) return <Loading />;

  return (
    <>
      <Link to="/doctors" className="small">‹ All doctors</Link>
      <Row className="g-4 mt-1">
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="avatar avatar-lg mb-3">{doctor.first_name[0]}{doctor.last_name[0]}</div>
              <h1 className="h4">{doctor.full_name}</h1>
              <p className="text-muted mb-2">{doctor.specialisation}</p>
              <p className="small">{doctor.bio}</p>
              {doctor.phone && <p className="small mb-0">Phone: {doctor.phone}</p>}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h2 className="h5 mb-3">Consultation schedule</h2>
              {bookingError && <Alert variant="danger">{bookingError}</Alert>}
              <SlotPicker key={pickerKey} doctorId={doctor.id}
                          selectedSlot={selectedSlot} onSelect={setSelectedSlot} />

              {selectedSlot && (
                <div className="booking-box mt-4 p-3 rounded-3">
                  <p className="mb-2">
                    <strong>{formatDate(selectedSlot.date)}</strong> at{' '}
                    <strong>{formatTime(selectedSlot.start_time)}</strong> –{' '}
                    {formatTime(selectedSlot.end_time)}
                  </p>
                  {user ? (
                    user.is_admin ? (
                      <Alert variant="info" className="mb-0">
                        Administrators book for patients from the Admin Dashboard.
                      </Alert>
                    ) : (
                      <>
                        <Form.Group className="mb-3" controlId="reason">
                          <Form.Label>Reason for visit (optional)</Form.Label>
                          <Form.Control value={reason} maxLength={255}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g. repeat prescription" />
                        </Form.Group>
                        <Button onClick={book} disabled={busy}>
                          {busy ? 'Booking...' : 'Confirm booking'}
                        </Button>
                      </>
                    )
                  ) : (
                    <Button onClick={() => navigate('/login', { state: { from: `/doctors/${id}` } })}>
                      Log in to book this time
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking confirmation notification */}
      <Modal show={!!confirmed} onHide={() => setConfirmed(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>✅ Appointment confirmed</Modal.Title>
        </Modal.Header>
        {confirmed && (
          <Modal.Body>
            <p>Your appointment with <strong>{confirmed.doctor_name}</strong> is booked for{' '}
              <strong>{formatDate(confirmed.date)}</strong> at{' '}
              <strong>{formatTime(confirmed.start_time)}</strong>.</p>
            <p className="mb-0 text-muted small">Booking reference #{confirmed.id}. A copy has
              been added to your notifications.</p>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => { setConfirmed(null); setPickerKey(pickerKey + 1); }}>
            Book another
          </Button>
          <Button onClick={() => navigate('/my-appointments')}>View my appointments</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DoctorDetail;
