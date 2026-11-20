import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import api, { errorMessage } from '../api';
import Loading from '../components/Loading';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load doctors (re-runs when the search text changes)
  useEffect(() => {
    const timer = setTimeout(() => {
      api.get('doctors/', { params: search ? { search } : {} })
        .then((res) => setDoctors(res.data))
        .catch((err) => setError(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 300); // small delay so we don't call the API on every key press
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
        <h1 className="h3 mb-0">Our doctors</h1>
        <Form.Control placeholder="Search by name or specialty" value={search}
                      onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Loading /> : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {doctors.map((doctor) => (
            <Col key={doctor.id}>
              <Card className="h-100 shadow-sm border-0 doctor-card">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="avatar">{doctor.first_name[0]}{doctor.last_name[0]}</div>
                    <div>
                      <Card.Title className="mb-0">{doctor.full_name}</Card.Title>
                      <small className="text-muted">{doctor.specialisation}</small>
                    </div>
                  </div>
                  <Card.Text className="text-muted small flex-grow-1">{doctor.bio}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge bg={doctor.upcoming_available_slots ? 'success' : 'secondary'}>
                      {doctor.upcoming_available_slots} open slots
                    </Badge>
                    <Button as={Link} to={`/doctors/${doctor.id}`} size="sm">
                      View schedule &amp; book
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {doctors.length === 0 && <p className="text-muted">No doctors found.</p>}
        </Row>
      )}
    </>
  );
}

export default Doctors;
