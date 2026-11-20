import { Outlet } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Menu from './Menu';

// Layout route: every page is rendered inside <Outlet/>
function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Menu />
      <main className="flex-grow-1 py-4">
        <Container>
          <Outlet />
        </Container>
      </main>
      <footer className="site-footer py-3 mt-auto">
        <Container className="d-flex flex-column flex-md-row justify-content-between small">
          <span>© {new Date().getFullYear()} Piki Ora Medical Centre</span>
          <span>In an emergency, call 111.</span>
        </Container>
      </footer>
    </div>
  );
}

export default Layout;
