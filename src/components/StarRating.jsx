import React, { useEffect, useState } from 'react';

// StarRating now integrates with backend if available. It still falls back
// to localStorage for voter id and optimistic UI while offline.
// Props: employeeId, size, readOnly

const RATINGS_LOCAL_KEY = 'employee_ratings';
const VOTER_ID_KEY = 'voter_id';

function ensureVoterId() {
  let id = localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = 'voter_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}

async function fetchRatingFromApi(employeeId, voterId) {
  try {
    const url = `/api/ratings/${employeeId}?voterId=${encodeURIComponent(voterId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('no api');
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function postRatingToApi(payload) {
  try {
    const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('post failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function deleteRatingFromApi(employeeId, voterId) {
  try {
    const res = await fetch('/api/ratings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, voterId }) });
    if (!res.ok) throw new Error('delete failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default function StarRating({ employeeId, size = 18, readOnly = false }) {
  const id = String(employeeId);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null); // user's rating number if exists
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const voterId = ensureVoterId();

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Try API first
      const api = await fetchRatingFromApi(id, voterId);
      if (api && mounted) {
        setAvg(api.avg || 0);
        setCount(api.count || 0);
        setUser(api.userRating || null);
        return;
      }

      // Fallback to localStorage aggregated
      try {
        const raw = localStorage.getItem(RATINGS_LOCAL_KEY) || '{}';
        const obj = JSON.parse(raw);
        const arr = obj[id] || [];
        const c = arr.length;
        const a = c ? arr.reduce((s, v) => s + v, 0) / c : 0;
        if (mounted) {
          setAvg(a);
          setCount(c);
          // user rating isn't tracked locally per voter in this fallback
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [id, voterId]);

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  async function submitRating(value) {
    if (readOnly) return;
    setMessage('');
    // Optimistic UI update
    const prevAvg = avg; const prevCount = count; const prevUser = user;
    const newCount = user ? count : count + 1;
    const newAvg = user ? ((avg * count - user + value) / count) : ((avg * count + value) / newCount);
    setAvg(newAvg); setCount(newCount); setUser(value);

    // Try API
    const res = await postRatingToApi({ employeeId: id, rating: Number(value), voterId });
    if (res && res.ok) {
      setAvg(res.avg); setCount(res.count); setUser(res.userRating || value);
      setMessage('Gracias por valorar 😊');
      setTimeout(() => setMessage(''), 2500);
      return;
    }

    // If API failed, persist locally
    try {
      const raw = localStorage.getItem(RATINGS_LOCAL_KEY) || '{}';
      const obj = JSON.parse(raw);
      obj[id] = [...(obj[id] || []), Number(value)];
      localStorage.setItem(RATINGS_LOCAL_KEY, JSON.stringify(obj));
      setMessage('Valoración guardada localmente');
      setTimeout(() => setMessage(''), 2500);
    } catch (e) {
      // rollback
      setAvg(prevAvg); setCount(prevCount); setUser(prevUser);
      setMessage('No se pudo guardar la valoración');
      setTimeout(() => setMessage(''), 2500);
    }
  }

  async function removeRating() {
    if (readOnly) return;
    const res = await deleteRatingFromApi(id, voterId);
    if (res && res.ok) {
      setAvg(res.avg || 0); setCount(res.count || 0); setUser(null);
      setMessage('Valoración eliminada');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    // fallback: cannot remove from local aggregated list reliably
    setMessage('No fue posible eliminar (offline)');
    setTimeout(() => setMessage(''), 2000);
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'inline-flex', gap: 4 }}>
        {stars.map((s) => {
          const filled = hover ? s <= hover : (user ? s <= user : s <= Math.round(avg));
          return (
            <button
              key={s}
              title={`${s} estrella${s>1?'s':''}`}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => submitRating(s)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: readOnly ? 'default' : 'pointer',
                fontSize: size,
                color: filled ? '#f59e0b' : '#e5e7eb',
              }}
              aria-label={`Valorar ${s} estrellas`}
              aria-pressed={user ? s <= user : false}
            >
              ★
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: Math.max(12, size - 4), color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
        <strong>{count ? (Math.round(avg * 10) / 10) : '0.0'}</strong>
        <span style={{ color: '#777' }}>({count})</span>
        {!readOnly && user && (
          <button onClick={removeRating} style={{ marginLeft: 8, background: 'transparent', border: '1px solid #eee', padding: '4px 6px', borderRadius: 6, cursor: 'pointer' }}>Eliminar</button>
        )}
      </div>
      {message && <div style={{ marginLeft: 8, color: '#16a34a', fontSize: 12 }}>{message}</div>}
    </div>
  );
}
