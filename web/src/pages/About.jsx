import ProductImage from '../components/ProductImage';
import { ABOUT_VALUES } from '../data/content';

export default function About() {
  return (
    <div>
      <section style={{ position: 'relative', height: '60vh', minHeight: 440, overflow: 'hidden' }}>
        <ProductImage imageKey="about-hero.jpg" label="Orchard / farm landscape photo" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,20,12,.75), rgba(26,20,12,.15))' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', color: '#fff' }}>
          <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#D4AF37', fontWeight: 600 }}>SINCE 1998</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 700, marginTop: 14 }}>Our Story</h1>
        </div>
      </section>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '90px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 26, lineHeight: 1.6, color: '#3a2c1a' }}>
          It began with a single sack of almonds and a promise: never sell anything we wouldn't feed our own family.
        </p>
      </section>
      <section className="grid-2-to-1" style={{ maxWidth: 1360, margin: '0 auto', padding: '0 32px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '4/5', boxShadow: '0 30px 60px rgba(106,78,47,.18)' }}>
          <ProductImage imageKey="founder.jpg" label="Founder portrait" />
        </div>
        <div>
          <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.2em', color: '#B08D3E', fontWeight: 600 }}>OUR ROOTS</span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: '#2a1f12', margin: '14px 0 0' }}>A family trade, three generations deep</h2>
          <p style={{ color: '#6c5c47', fontSize: 15, lineHeight: 1.8, marginTop: 18 }}>
            Founded in a small Nashik warehouse in 1998, Fresh Dry Fruits started as a direct line between orchard families and neighborhood kitchens. Today we work with growers across 12 countries — but every batch is still tasted, sorted and sealed by hand before it reaches you.
          </p>
          <p style={{ color: '#6c5c47', fontSize: 15, lineHeight: 1.8, marginTop: 14 }}>No fillers. No preservatives. No shortcuts. Just the fruit, at its best.</p>
        </div>
      </section>
      <section style={{ background: '#fff', borderTop: '1px solid rgba(106,78,47,.1)', padding: '90px 32px' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: '#2a1f12', marginBottom: 50 }}>What we stand for</h2>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }}>
            {ABOUT_VALUES.map((v) => (
              <div key={v.title} style={{ textAlign: 'center', padding: '36px 24px' }}>
                <div style={{ fontSize: 36 }}>{v.icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600, color: '#2a1f12', marginTop: 14 }}>{v.title}</div>
                <p style={{ color: '#8a7a63', fontSize: 13.5, marginTop: 8, lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '90px 32px' }}>
        <h2 style={{ textAlign: 'center', fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: '#2a1f12', marginBottom: 50 }}>From our farms</h2>
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {['farm-1.jpg', 'farm-2.jpg', 'farm-3.jpg', 'farm-4.jpg'].map((key) => (
            <div key={key} style={{ borderRadius: 18, overflow: 'hidden', aspectRatio: '3/4' }}>
              <ProductImage imageKey={key} label="Farm photo" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
