import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

const label = { fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '.08em', color: '#8a7a63', textTransform: 'uppercase', marginBottom: 6, display: 'block' };
const input = { border: '1px solid rgba(106,78,47,.2)', borderRadius: 12, padding: '13px 16px', fontFamily: "'Poppins',sans-serif", fontSize: 13.5, outline: 'none', width: '100%' };
const card = { background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 28 };
const heading = { fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#2a1f12', marginBottom: 18 };
const primaryBtn = { fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13.5, background: '#6A4E2F', color: '#fff', border: 'none', padding: '13px 26px', borderRadius: 100, cursor: 'pointer' };

function Note({ msg }) {
  if (!msg) return null;
  const ok = msg.type === 'ok';
  return <div role="status" style={{ fontSize: 12.5, marginTop: 12, color: ok ? '#34A853' : '#EA4335' }}>{msg.text}</div>;
}

export default function Account() {
  const { user, token, applyAuth, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const pwRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => { setName(user?.name || ''); setEmail(user?.email || ''); }, [user]);
  useEffect(() => { if (hash === '#password') pwRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [hash]);

  if (!user) {
    return (
      <section style={{ maxWidth: 620, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#2a1f12', margin: '14px 0 8px' }}>Your account</h1>
        <p style={{ color: '#6c5c47', fontSize: 15 }}>Sign in to manage your profile.</p>
        <button onClick={() => navigate('/')} style={{ ...primaryBtn, marginTop: 20 }}>Back to home</button>
      </section>
    );
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileMsg(null);
    if (!name.trim() || !email.trim()) { setProfileMsg({ type: 'err', text: 'Name and email are required.' }); return; }
    setProfileBusy(true);
    try {
      const updated = await api.updateProfile({ name: name.trim(), email: email.trim() }, token);
      applyAuth(updated);
      setProfileMsg({ type: 'ok', text: 'Profile updated.' });
      showToast('Profile updated');
    } catch (err) {
      setProfileMsg({ type: 'err', text: err.message });
    } finally {
      setProfileBusy(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (next.length < 8) { setPwMsg({ type: 'err', text: 'New password must be at least 8 characters.' }); return; }
    if (next !== confirm) { setPwMsg({ type: 'err', text: 'New passwords do not match.' }); return; }
    setPwBusy(true);
    try {
      await api.changePassword({ currentPassword: current, newPassword: next }, token);
      setCurrent(''); setNext(''); setConfirm('');
      setPwMsg({ type: 'ok', text: 'Password changed.' });
      showToast('Password changed');
    } catch (err) {
      setPwMsg({ type: 'err', text: err.message });
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: '64px 32px 100px' }}>
      <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>YOUR ACCOUNT</span>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 700, color: '#2a1f12', margin: '14px 0 6px' }}>Hi, {user.name.split(' ')[0]}</h1>
      <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: '#6A4E2F', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>View order history →</button>

      <div style={{ display: 'grid', gap: 20, marginTop: 30 }}>
        {/* Manage profile */}
        <form onSubmit={saveProfile} style={card}>
          <h2 style={heading}>Manage profile</h2>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={label} htmlFor="acc-name">Full name</label>
              <input id="acc-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} style={input} />
            </div>
            <div>
              <label style={label} htmlFor="acc-email">Email</label>
              <input id="acc-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
            </div>
          </div>
          <Note msg={profileMsg} />
          <button type="submit" disabled={profileBusy} style={{ ...primaryBtn, marginTop: 16, opacity: profileBusy ? 0.7 : 1 }}>
            {profileBusy ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        {/* Change password */}
        <form ref={pwRef} onSubmit={savePassword} style={card}>
          <h2 style={heading}>Change password</h2>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={label} htmlFor="acc-current">Current password</label>
              <input id="acc-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} style={input} />
            </div>
            <div>
              <label style={label} htmlFor="acc-new">New password</label>
              <input id="acc-new" type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} style={input} placeholder="At least 8 characters" />
            </div>
            <div>
              <label style={label} htmlFor="acc-confirm">Confirm new password</label>
              <input id="acc-confirm" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} style={input} />
            </div>
          </div>
          <Note msg={pwMsg} />
          <button type="submit" disabled={pwBusy} style={{ ...primaryBtn, marginTop: 16, opacity: pwBusy ? 0.7 : 1 }}>
            {pwBusy ? 'Saving…' : 'Update password'}
          </button>
        </form>

        {/* Sign out */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#2a1f12' }}>Sign out</div>
            <div style={{ fontSize: 12.5, color: '#8a7a63', marginTop: 2 }}>Signed in as {user.email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13.5, background: '#fff', color: '#EA4335', border: '1.5px solid rgba(234,67,53,.4)', padding: '12px 26px', borderRadius: 100, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
    </section>
  );
}
