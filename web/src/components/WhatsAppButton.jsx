export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919315223605"
      target="_blank"
      rel="noreferrer"
      title="Chat on WhatsApp"
      style={{
        position: 'fixed', bottom: 26, right: 26, zIndex: 70, width: 56, height: 56, borderRadius: '50%',
        background: '#25D366', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 26,
        boxShadow: '0 10px 26px rgba(37,211,102,.45)', animation: 'pulseRing 2.4s infinite',
      }}
    >
      ✆
    </a>
  );
}
