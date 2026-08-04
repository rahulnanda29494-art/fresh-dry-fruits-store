import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const input = { border: '1px solid rgba(106,78,47,.2)', borderRadius: 12, padding: '13px 16px', fontFamily: "'Poppins',sans-serif", fontSize: 13.5, outline: 'none', width: '100%' };
const label = { fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '.08em', color: '#8a7a63', textTransform: 'uppercase', marginBottom: 6, display: 'block' };
const primaryBtn = { fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: 15, borderRadius: 100, cursor: 'pointer', width: '100%' };

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (next.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      await api.resetPassword({ token, newPassword: next });
      setDone(true);
      showToast('Password reset — please sign in');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const shell = (children) => (
    <section style={{ maxWidth: 440, margin: '0 auto', padding: '80px 32px 100px' }}>
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>FRESH DRY FRUITS</span>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: '#2a1f12', margin: '12px 0 24px' }}>Set a new password</h1>
      {children}
    </section>
  );

  if (!token) {
    return shell(
      <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 30, textAlign: 'center' }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <p style={{ color: '#6c5c47', fontSize: 14.5, marginTop: 10 }}>This reset link is missing its token. Request a new one from the sign-in screen.</p>
        <button onClick={() => navigate('/')} style={{ ...primaryBtn, marginTop: 18 }}>Back to home</button>
      </div>
    );
  }

  if (done) {
    return shell(
      <div style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 30, textAlign: 'center' }}>
        <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#EAF3DC', display: 'grid', placeItems: 'center', fontSize: 32, color: '#34A853', margin: '0 auto' }}>✓</div>
        <p style={{ color: '#3a2c1a', fontSize: 15.5, marginTop: 14, fontWeight: 600 }}>Your password has been reset.</p>
        <p style={{ color: '#8a7a63', fontSize: 13, marginTop: 6 }}>You can now sign in with your new password.</p>
        <button onClick={() => navigate('/')} style={{ ...primaryBtn, marginTop: 20 }}>Go to home &amp; sign in</button>
      </div>
    );
  }

  return shell(
    <form onSubmit={submit} style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 28, display: 'grid', gap: 14 }}>
      <div>
        <label style={label} htmlFor="rp-new">New password</label>
        <input id="rp-new" type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} style={input} placeholder="At least 8 characters" required />
      </div>
      <div>
        <label style={label} htmlFor="rp-confirm">Confirm new password</label>
        <input id="rp-confirm" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={input} required />
      </div>
      {error && <div role="alert" style={{ color: '#EA4335', fontSize: 12.5 }}>{error}</div>}
      <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>{busy ? 'Saving…' : 'Reset password'}</button>
    </form>
  );
}
