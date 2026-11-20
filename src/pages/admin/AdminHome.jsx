import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import api, { errorMessage } from '../../api';
import Loading from '../../components/Loading';
import { formatTime, todayISO } from '../../format';

function AdminHome() {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('admin/stats/')
      .then((res) => setStats(res.data))
      .catch((err) => setError(errorMessage(err)));
    api.get('appointments/', { params: { date: todayISO(), status: 'booked' } })
      .then((res) => setToday(res.data))
      .catch(() => setToday([]));
  }, []);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stats) return <Loading />;

  const cards = [
    ['Appointments today', stats.appointments_today, '/admin/appointments'],
    ['Upcoming bookings', stats.upcoming_appointments, '/admin/appointments'],
    ['Available slots', stats.available_slots, '/admin/slots'],
    ['Active doctors', stats.doctors, '/admin/doctors'],
    ['Patients', stats.patients, '/admin/patients'],
    ['Cancelled', stats.cancelled, '/admin/appointments'],
  ];

  return (
    <>
      <h1 className="h3 mb-3">Overview</h1>
      <Row xs={2} lg={3} className="g-3 mb-4">
        {cards.map(([label, value, to]) => (
          <Col key={label}>
            <Card as={Link} to={to} className="stat-card shadow-sm border-0 text-decoration-none h-100">
              <Card.Body>
                <div className="stat-value">{value}</div>
                <div className="text-muted small">{label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h2 className="h5">Today's schedule</h2>
      {today.length === 0 ? <p className="text-muted">No appointments booked for today.</p> : (
        <Table responsive hover className="bg-white">
          <thead><tr><th>Time</th><th>Doctor</th><th>Patient</th><th>Reason</th></tr></thead>
          <tbody>
            {today.map((a) => (
              <tr key={a.id}>
                <td>{formatTime(a.start_time)}</td>
                <td>{a.doctor_name}</td>
                <td>{a.patient_name}</td>
                <td>{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

export default AdminHome;
