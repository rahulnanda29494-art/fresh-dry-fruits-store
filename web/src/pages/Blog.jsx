import ProductImage from '../components/ProductImage';
import { BLOG_POSTS } from '../data/content';

export default function Blog() {
  return (
    <div>
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '64px 32px 30px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>THE JOURNAL</span>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 46, fontWeight: 700, color: '#2a1f12', margin: '14px 0 0' }}>Stories, recipes &amp; rituals</h1>
      </section>
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 32px 0' }}>
        <div className="grid-2-to-1" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 36, background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 26, overflow: 'hidden' }}>
          <div style={{ aspectRatio: '4/3' }}><ProductImage imageKey="almonds.jpg" label="Featured article photo" /></div>
          <div style={{ padding: '44px 44px 44px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 11, letterSpacing: '.1em', color: '#B08D3E', fontWeight: 700 }}>FEATURED · NUTRITION</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#2a1f12', margin: '12px 0 0', lineHeight: 1.25 }}>Why a handful of almonds a day changes everything</h2>
            <p style={{ color: '#6c5c47', fontSize: 14.5, lineHeight: 1.7, marginTop: 14 }}>The science behind the world's most beloved snack — and how to tell real freshness from a stale shelf.</p>
            <span style={{ fontSize: 12.5, color: '#8a7a63', marginTop: 18 }}>March 14, 2026 · 6 min read</span>
          </div>
        </div>
      </section>
      <section className="grid-3" style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 32px 100px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }}>
        {BLOG_POSTS.map((b) => (
          <article key={b.title} className="blog-card" style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, overflow: 'hidden', transition: 'transform .3s, box-shadow .3s', cursor: 'pointer' }}>
            <div style={{ aspectRatio: '16/10' }}><ProductImage imageKey={b.image} label={b.title} /></div>
            <div style={{ padding: 22 }}>
              <span style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 10.5, letterSpacing: '.1em', color: '#B08D3E', fontWeight: 700 }}>{b.tag}</span>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600, color: '#2a1f12', margin: '10px 0 0', lineHeight: 1.3 }}>{b.title}</h3>
              <p style={{ color: '#8a7a63', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{b.excerpt}</p>
              <span style={{ display: 'block', fontSize: 12, color: '#a08a63', marginTop: 14 }}>{b.date} · {b.read}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
