import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import api, { errorMessage } from '../api';
import Loading from '../components/Loading';

function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    api.get('notifications/')
      .then((res) => setItems(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markAllRead() {
    await api.post('notifications/mark_all_read/');
    load();
  }

  async function markRead(item) {
    await api.patch(`notifications/${item.id}/`, { is_read: true });
    load();
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Notifications</h1>
        {items.some((n) => !n.is_read) && (
          <Button size="sm" variant="outline-primary" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Loading /> : (
        <ListGroup>
          {items.length === 0 && <ListGroup.Item>No notifications yet.</ListGroup.Item>}
          {items.map((n) => (
            <ListGroup.Item key={n.id} action={!n.is_read} onClick={() => !n.is_read && markRead(n)}
                            className={n.is_read ? 'text-muted' : 'fw-semibold'}>
              <div>{n.message}</div>
              <small className="text-muted fw-normal">
                {new Date(n.created_at).toLocaleString('en-NZ')}
              </small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  );
}

export default Notifications;
