import { NavLink, Outlet } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';

// Nested layout for the administrator dashboard: side menu + <Outlet/>
function AdminLayout() {
  const links = [
    ['/admin', 'Overview'],
    ['/admin/appointments', 'Appointments'],
    ['/admin/doctors', 'Doctors'],
    ['/admin/slots', 'Appointment slots'],
    ['/admin/patients', 'Patients'],
  ];

  return (
    <Row className="g-4">
      <Col md={3} lg={2}>
        <div className="admin-sidebar rounded-3 p-2">
          <div className="small text-uppercase text-muted fw-semibold px-2 pt-1 pb-2">
            Admin dashboard
          </div>
          <Nav variant="pills" className="flex-md-column flex-row flex-wrap">
            {links.map(([to, label]) => (
              <Nav.Link key={to} as={NavLink} to={to} end={to === '/admin'}>{label}</Nav.Link>
            ))}
          </Nav>
        </div>
      </Col>
      <Col md={9} lg={10}>
        <Outlet />
      </Col>
    </Row>
  );
}

export default AdminLayout;
