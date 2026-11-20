import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero rounded-4 p-4 p-md-5 mb-4">
        <h1 className="display-6 fw-semibold">Kia ora, welcome to Piki Ora Medical Centre</h1>
        <p className="lead mb-4">
          Book, change or cancel your appointment online, any time.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <Button as={Link} to="/doctors" variant="light" size="lg">Book an appointment</Button>
          {user && !user.is_admin && (
            <Button as={Link} to="/my-appointments" variant="outline-light" size="lg">
              My appointments
            </Button>
          )}
          {user?.is_admin && (
            <Button as={Link} to="/admin" variant="outline-light" size="lg">Admin dashboard</Button>
          )}
          {!user && (
            <Button as={Link} to="/register" variant="outline-light" size="lg">Create an account</Button>
          )}
        </div>
      </section>

      <Row xs={1} md={3} className="g-3">
        {[
          ['1. Choose a doctor', 'See our doctors, what they specialise in and when they are free.'],
          ['2. Pick a time', 'Choose any open slot. Slots already taken are never shown, so no double bookings.'],
          ['3. Get confirmation', 'You get a confirmation notification straight away, and can change or cancel later.'],
        ].map(([title, text]) => (
          <Col key={title}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text className="text-muted">{text}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default Home;
