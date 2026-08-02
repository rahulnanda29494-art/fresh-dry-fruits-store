import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(''), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ message, showToast }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: 26, left: '50%', zIndex: 120,
          transform: `translateX(-50%) translateY(${message ? '0' : '20px'})`,
          background: '#1A1A1A', color: '#fff', fontFamily: 'Montserrat,sans-serif',
          fontSize: 13, fontWeight: 600, padding: '14px 24px', borderRadius: 100,
          boxShadow: '0 16px 40px rgba(0,0,0,.35)', opacity: message ? 1 : 0,
          transition: '.35s', pointerEvents: 'none',
        }}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
