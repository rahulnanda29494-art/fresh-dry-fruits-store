import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

const fieldStyle = {
  border: '1px solid rgba(106,78,47,.2)', borderRadius: 12, padding: '13px 16px',
  fontFamily: "'Poppins',sans-serif", fontSize: 13.5, outline: 'none', width: '100%',
};

const linkBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#6A4E2F', fontWeight: 700, fontSize: 12.5, textDecoration: 'underline', padding: 0 };

export default function AuthModal({ onClose }) {
  const { signup, login } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const firstField = useRef(null);

  // Focus the natural first field whenever the mode switches — standard modal
  // behaviour so keyboard users can start typing immediately.
  useEffect(() => { firstField.current?.focus(); }, [mode]);

  function switchMode(m) {
    setMode(m);
    setError('');
    setInfo('');
    setDevResetUrl('');
    setConfirm('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'forgot') {
      setBusy(true);
      try {
        const res = await api.forgotPassword({ email: email.trim() });
        setInfo(res.message || 'If an account exists for that email, a reset link has been sent.');
        setDevResetUrl(res.devResetUrl || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const user = await signup(name.trim(), email.trim(), password);
        showToast(`Welcome, ${user.name.split(' ')[0]}!`);
      } else {
        const user = await login(email.trim(), password);
        showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShowPw((v) => !v)}
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#8a7a63', fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}
      tabIndex={-1}
    >
      {showPw ? 'HIDE' : 'SHOW'}
    </button>
  );

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(26,20,12,.55)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ background: '#fff', borderRadius: 24, maxWidth: 400, width: '100%', padding: 40, position: 'relative', boxShadow: '0 40px 90px rgba(0,0,0,.4)' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, background: '#F5EFE2', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16, color: '#6A4E2F' }}>✕</button>

        {mode === 'forgot' ? (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#2a1f12', margin: 0 }}>Reset password</h2>
            <p style={{ fontSize: 12.5, color: '#8a7a63', marginTop: 8 }}>Enter your account email and we’ll send you a link to set a new password.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 22, marginBottom: 24 }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                  fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700,
                  color: mode === m ? '#2a1f12' : '#c8bba2',
                  borderBottom: mode === m ? '2px solid #D4AF37' : '2px solid transparent',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          {mode === 'signup' && (
            <input
              ref={mode === 'signup' ? firstField : null}
              required name="name" autoComplete="name" placeholder="Full name"
              value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle}
            />
          )}
          <input
            ref={mode !== 'signup' ? firstField : null}
            required type="email" name="email" autoComplete="email" inputMode="email" autoCapitalize="none"
            placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle}
          />
          {mode !== 'forgot' && (
            <div style={{ position: 'relative' }}>
              <input
                required type={showPw ? 'text' : 'password'} name="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={8} placeholder={mode === 'signup' ? 'Password (min. 8 characters)' : 'Password'}
                value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...fieldStyle, paddingRight: 62 }}
              />
              {pwToggle}
            </div>
          )}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <button type="button" onClick={() => switchMode('forgot')} style={{ ...linkBtn, fontSize: 12, textDecoration: 'none', color: '#8a7a63', fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>
          )}
          {mode === 'signup' && (
            <input
              required type={showPw ? 'text' : 'password'} name="confirmPassword" autoComplete="new-password"
              minLength={8} placeholder="Confirm password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} style={fieldStyle}
            />
          )}
          {error && <div role="alert" style={{ color: '#EA4335', fontSize: 12.5 }}>{error}</div>}
          {info && (
            <div role="status" style={{ color: '#34A853', fontSize: 12.5, lineHeight: 1.5 }}>
              {info}
              {devResetUrl && (
                <div style={{ marginTop: 8, color: '#8a7a63' }}>
                  Dev mode (no email configured) — <a href={devResetUrl} style={{ color: '#6A4E2F', fontWeight: 700 }}>open your reset link</a>.
                </div>
              )}
            </div>
          )}
          <button type="submit" disabled={busy} style={{ marginTop: 6, fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: 15, borderRadius: 100, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: '#8a7a63' }}>
          {mode === 'forgot' ? (
            <button type="button" onClick={() => switchMode('login')} style={linkBtn}>← Back to sign in</button>
          ) : (
            <>
              {mode === 'login' ? 'New here? ' : 'Already have an account? '}
              <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} style={linkBtn}>
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
