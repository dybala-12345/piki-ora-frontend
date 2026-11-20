import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import api, { errorMessage } from '../../api';
import Loading from '../../components/Loading';
import { addDaysISO, formatDate, formatTime, todayISO } from '../../format';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function AdminSlots() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // single slot form
  const [single, setSingle] = useState({ start_time: '09:00', end_time: '09:30' });
  // bulk generator form
  const [bulk, setBulk] = useState({
    start_date: todayISO(), end_date: addDaysISO(todayISO(), 13),
    day_start: '09:00', day_end: '17:00', duration_minutes: 30, weekdays: [0, 1, 2, 3, 4],
  });

  useEffect(() => {
    api.get('doctors/').then((res) => {
      setDoctors(res.data);
      if (res.data.length) setDoctorId(String(res.data[0].id));
    }).catch((err) => setError(errorMessage(err)));
  }, []);

  function loadSlots() {
    if (!doctorId) return;
    setLoading(true);
    api.get('slots/', { params: { doctor: doctorId, date } })
      .then((res) => setSlots(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(loadSlots, [doctorId, date]);

  async function addSingle(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('slots/', { doctor: doctorId, date, ...single });
      setMessage('Slot added.');
      loadSlots();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function generate(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('slots/bulk/', { doctor: doctorId, ...bulk });
      setMessage(`${res.data.created} slots created` +
        (res.data.skipped ? `, ${res.data.skipped} skipped because they already existed.` : '.'));
      loadSlots();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function removeSlot(slot) {
    setError('');
    try {
      await api.delete(`slots/${slot.id}/`);
      loadSlots();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function toggleDay(i) {
    const weekdays = bulk.weekdays.includes(i)
      ? bulk.weekdays.filter((d) => d !== i)
      : [...bulk.weekdays, i];
    setBulk({ ...bulk, weekdays });
  }

  return (
    <>
      <h1 className="h3 mb-3">Appointment slots</h1>
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Form.Group className="mb-3" style={{ maxWidth: 360 }}>
        <Form.Label>Doctor</Form.Label>
        <Form.Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </Form.Select>
      </Form.Group>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <Button size="sm" variant="outline-secondary" onClick={() => setDate(addDaysISO(date, -1))}>‹</Button>
                <Form.Control type="date" value={date} style={{ maxWidth: 180 }}
                              onChange={(e) => e.target.value && setDate(e.target.value)} />
                <Button size="sm" variant="outline-secondary" onClick={() => setDate(addDaysISO(date, 1))}>›</Button>
                <span className="small text-muted">{formatDate(date)}</span>
              </div>
              {loading ? <Loading /> : slots.length === 0 ? (
                <p className="text-muted mb-0">No slots on this day.</p>
              ) : (
                <Table size="sm" responsive className="align-middle mb-0">
                  <thead><tr><th>Time</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {slots.map((s) => (
                      <tr key={s.id}>
                        <td>{formatTime(s.start_time)} – {formatTime(s.end_time)}</td>
                        <td>
                          {s.is_booked ? <Badge bg="warning" text="dark">Booked</Badge>
                            : <Badge bg="success">Available</Badge>}
                        </td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-danger" disabled={s.is_booked}
                                  onClick={() => removeSlot(s)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              <hr />
              <Form onSubmit={addSingle} className="d-flex gap-2 align-items-end flex-wrap">
                <Form.Group>
                  <Form.Label className="small">Start</Form.Label>
                  <Form.Control type="time" value={single.start_time} required
                                onChange={(e) => setSingle({ ...single, start_time: e.target.value })} />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="small">End</Form.Label>
                  <Form.Control type="time" value={single.end_time} required
                                onChange={(e) => setSingle({ ...single, end_time: e.target.value })} />
                </Form.Group>
                <Button type="submit" variant="outline-primary">Add slot on this day</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="h6">Generate a schedule</Card.Title>
              <Form onSubmit={generate}>
                <Row className="g-2">
                  <Col xs={6}>
                    <Form.Label className="small">From</Form.Label>
                    <Form.Control type="date" value={bulk.start_date} required
                                  onChange={(e) => setBulk({ ...bulk, start_date: e.target.value })} />
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="small">To</Form.Label>
                    <Form.Control type="date" value={bulk.end_date} required
                                  onChange={(e) => setBulk({ ...bulk, end_date: e.target.value })} />
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="small">Day starts</Form.Label>
                    <Form.Control type="time" value={bulk.day_start} required
                                  onChange={(e) => setBulk({ ...bulk, day_start: e.target.value })} />
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="small">Day ends</Form.Label>
                    <Form.Control type="time" value={bulk.day_end} required
                                  onChange={(e) => setBulk({ ...bulk, day_end: e.target.value })} />
                  </Col>
                  <Col xs={12}>
                    <Form.Label className="small">Appointment length (minutes)</Form.Label>
                    <Form.Select value={bulk.duration_minutes}
                                 onChange={(e) => setBulk({ ...bulk, duration_minutes: Number(e.target.value) })}>
                      {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={12}>
                    <Form.Label className="small d-block">Days</Form.Label>
                    {DAYS.map((d, i) => (
                      <Form.Check inline key={d} id={`day-${i}`} label={d}
                                  checked={bulk.weekdays.includes(i)} onChange={() => toggleDay(i)} />
                    ))}
                  </Col>
                </Row>
                <Button type="submit" className="w-100 mt-3" disabled={!bulk.weekdays.length}>
                  Generate slots
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default AdminSlots;
