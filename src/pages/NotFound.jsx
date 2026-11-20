import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="h3">Page not found</h1>
      <p className="text-muted">The page you are looking for doesn't exist.</p>
      <Button as={Link} to="/">Go home</Button>
    </div>
  );
}

export default NotFound;
