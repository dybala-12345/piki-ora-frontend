import Spinner from 'react-bootstrap/Spinner';

function Loading({ text = 'Loading...' }) {
  return (
    <div className="text-center text-muted py-5">
      <Spinner animation="border" size="sm" className="me-2" />
      {text}
    </div>
  );
}

export default Loading;
