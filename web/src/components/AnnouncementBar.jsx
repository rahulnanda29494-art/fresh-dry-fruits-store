const ITEMS = [
  <>✦ &nbsp;FREE SHIPPING ON ORDERS OVER ₹1499</>,
  <>✦ &nbsp;USE CODE <b style={{ color: '#D4AF37' }}>FRESH10</b> FOR 10% OFF YOUR FIRST BOX</>,
  <>✦ &nbsp;100% NATURAL · NO PRESERVATIVES</>,
  <>✦ &nbsp;📞 +91 93152 23605 &nbsp;·&nbsp; WhatsApp us anytime</>,
];

export default function AnnouncementBar() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div style={{ background: '#1A1A1A', color: '#F5EFE2', fontFamily: "'Montserrat',sans-serif", fontSize: 12.5, letterSpacing: '.06em', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <div style={{ display: 'inline-flex', gap: 56, padding: '10px 0', animation: 'marquee 32s linear infinite' }}>
        {doubled.map((item, i) => <span key={i}>{item}</span>)}
      </div>
    </div>
  );
}
