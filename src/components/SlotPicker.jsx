import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import api, { errorMessage } from '../api';
import { addDaysISO, formatDate, formatTime, todayISO } from '../format';
import Loading from './Loading';

/**
 * Shows a doctor's available slots for one day and lets the user pick one.
 * Used by the booking page and the edit (reschedule) page.
 */
function SlotPicker({ doctorId, selectedSlot, onSelect, currentSlotId }) {
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // First, jump to the next day that has a free slot
  useEffect(() => {
    api.get('slots/', { params: { doctor: doctorId, available: 'true', from: todayISO() } })
      .then((res) => {
        const free = res.data.filter((s) => s.id !== currentSlotId);
        setDate(free.length ? free[0].date : todayISO());
      })
      .catch(() => setDate(todayISO()));
  }, [doctorId, currentSlotId]);

  // Then load the free slots for the chosen day
  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError('');
    api.get('slots/', { params: { doctor: doctorId, date, available: 'true' } })
      .then((res) => setSlots(res.data.filter((s) => s.id !== currentSlotId)))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [doctorId, date, currentSlotId]);

  if (!date) return <Loading text="Finding the next available time..." />;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <Button variant="outline-secondary" size="sm"
                disabled={date <= todayISO()}
                onClick={() => setDate(addDaysISO(date, -1))}>‹ Prev</Button>
        <Form.Control type="date" value={date} min={todayISO()} style={{ maxWidth: 180 }}
                      onChange={(e) => e.target.value && setDate(e.target.value)} />
        <Button variant="outline-secondary" size="sm"
                onClick={() => setDate(addDaysISO(date, 1))}>Next ›</Button>
        <span className="text-muted small">{formatDate(date)}</span>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? <Loading text="Finding available times..." /> : (
        slots.length === 0 ? (
          <Alert variant="light" className="border">
            No available times on this day. Try another date.
          </Alert>
        ) : (
          <div className="slot-grid">
            {slots.map((slot) => (
              <Button key={slot.id}
                      variant={selectedSlot?.id === slot.id ? 'primary' : 'outline-primary'}
                      onClick={() => onSelect(slot)}>
                {formatTime(slot.start_time)}
              </Button>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default SlotPicker;
