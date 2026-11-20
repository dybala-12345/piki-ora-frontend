import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  // Refresh the unread notification count whenever the page changes
  useEffect(() => {
    if (!user || user.is_admin) return;
    api.get('notifications/')
      .then((res) => setUnread(res.data.filter((n) => !n.is_read).length))
      .catch(() => setUnread(0));
  }, [user, location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <Navbar expand="lg" className="site-navbar" variant="dark" collapseOnSelect>
      <Container>
        {/* as={Link} switches page without reloading the whole app */}
        <Navbar.Brand as={Link} to="/" className="fw-semibold">
          <span className="brand-cross">+</span> Piki Ora Medical Centre
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/doctors">Doctors</Nav.Link>
            {user && !user.is_admin && (
              <Nav.Link as={NavLink} to="/my-appointments">My Appointments</Nav.Link>
            )}
            {user?.is_admin && (
              <Nav.Link as={NavLink} to="/admin">Admin Dashboard</Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                {!user.is_admin && (
                  <Nav.Link as={NavLink} to="/notifications">
                    Notifications{' '}
                    {unread > 0 && <Badge bg="warning" text="dark">{unread}</Badge>}
                  </Nav.Link>
                )}
                <NavDropdown title={user.first_name || user.username} id="user-menu" align="end">
                  <NavDropdown.ItemText className="small text-muted">
                    {user.is_admin ? 'Administrator' : 'Patient'}
                  </NavDropdown.ItemText>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">Log in</Nav.Link>
                <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Menu;
