import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useShopFilters } from '../context/ShopFiltersContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import Reveal from '../components/Reveal';
import { CATEGORIES } from '../data/categories';
import { TRUST_BADGES, BENEFITS, TESTIMONIALS, INSTAGRAM_IMAGES } from '../data/content';

const BEST_SELLER_ORDER = ['almonds', 'cashews', 'dates', 'mixed'];

export default function Home() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const filters = useShopFilters();
  const { showToast } = useToast();

  const heroArtRef = useRef(null);
  const [activeTesti, setActiveTesti] = useState(0);
  const [subEmail, setSubEmail] = useState('');
  const [subLabel, setSubLabel] = useState('Subscribe');

  useEffect(() => {
    const id = setInterval(() => setActiveTesti((i) => (i + 1) % TESTIMONIALS.length), 5200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onMove(e) {
      const art = heroArtRef.current;
      if (!art) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      art.querySelectorAll('[data-float]').forEach((el, i) => {
        const d = (i + 1) * 8;
        el.style.marginLeft = x * d + 'px';
        el.style.marginTop = y * d + 'px';
      });
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  function goShop(cat) {
    if (cat) filters.setCategoryOnly(cat);
    navigate('/shop');
  }

  function onSubscribe(e) {
    e.preventDefault();
    setSubLabel('✓ Welcome!');
    showToast("You're in! Check your inbox for 10% off.");
    setSubEmail('');
    setTimeout(() => setSubLabel('Subscribe'), 3000);
  }

  const bestSellers = BEST_SELLER_ORDER
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', padding: '70px 32px 90px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 72% 30%, rgba(212,175,55,.16), transparent 46%), radial-gradient(circle at 15% 80%, rgba(139,195,74,.12), transparent 44%)' }} />
        <div className="hero-grid" style={{ position: 'relative', maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid rgba(212,175,55,.4)', borderRadius: 100, padding: '7px 16px', fontFamily: "'Montserrat',sans-serif", fontSize: 11.5, fontWeight: 600, letterSpacing: '.12em', color: '#B08D3E', boxShadow: '0 6px 18px rgba(106,78,47,.08)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8BC34A', boxShadow: '0 0 0 3px rgba(139,195,74,.25)' }} /> HARVESTED THIS SEASON
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 'clamp(34px,4.8vw,68px)', lineHeight: 1.12, color: '#2a1f12', margin: '26px 0 0', letterSpacing: '-.01em' }}>
              Nature's finest,<br /><span style={{ fontStyle: 'italic', color: '#6A4E2F' }}>delivered</span> <span style={{ position: 'relative', whiteSpace: 'nowrap', display: 'inline-block' }}>fresh<span style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 11, background: 'linear-gradient(90deg,#D4AF37,#e9cf82)', zIndex: -1, borderRadius: 3 }} /></span>.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: '#5c4e3d', maxWidth: 480, margin: '24px 0 0' }}>
              Hand-selected nuts, dates &amp; berries from the world's most celebrated orchards — sun-cured, never processed, and sealed at peak freshness for your table.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 34 }}>
              <button className="hover-lift" onClick={() => goShop()} style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '.03em', background: '#6A4E2F', color: '#fff', border: 'none', padding: '17px 34px', borderRadius: 100, cursor: 'pointer', boxShadow: '0 14px 30px rgba(106,78,47,.32)', transition: 'transform .25s, box-shadow .25s' }}>Shop Now →</button>
              <button className="outline-btn border-strong" onClick={() => goShop()} style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '.03em', background: 'transparent', color: '#6A4E2F', border: '1.5px solid rgba(106,78,47,.35)', padding: '17px 30px', borderRadius: 100, cursor: 'pointer', transition: 'background .25s,border-color .25s' }}>Explore Collection</button>
            </div>
            <div style={{ display: 'flex', gap: 34, marginTop: 44 }}>
              <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#6A4E2F' }}>40k+</div><div style={{ fontSize: 12.5, color: '#8a7a63', letterSpacing: '.02em' }}>Happy customers</div></div>
              <div style={{ width: 1, background: 'rgba(106,78,47,.15)' }} />
              <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#6A4E2F' }}>4.9★</div><div style={{ fontSize: 12.5, color: '#8a7a63', letterSpacing: '.02em' }}>Avg. rating</div></div>
              <div style={{ width: 1, background: 'rgba(106,78,47,.15)' }} />
              <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#6A4E2F' }}>12</div><div style={{ fontSize: 12.5, color: '#8a7a63', letterSpacing: '.02em' }}>Countries sourced</div></div>
            </div>
          </div>

          <div ref={heroArtRef} className="hero-visual" style={{ position: 'relative', height: 520 }}>
            <div style={{ position: 'absolute', inset: '6% 8%', borderRadius: '50%', background: 'conic-gradient(from 120deg,#f6ecd0,#fff8ea,#f1e4c4,#f6ecd0)', animation: 'spinSlow 60s linear infinite', boxShadow: 'inset 0 0 80px rgba(212,175,55,.25)' }} />
            <div style={{ position: 'absolute', inset: '14%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 40px 80px rgba(106,78,47,.28), inset 0 0 0 1px rgba(255,255,255,.6)' }}>
              <ProductImage imageKey="gift-box.jpg" alt="Bowl of premium dry fruits" label="Bowl of premium dry fruits" />
            </div>
            <div data-float="1" style={{ position: 'absolute', top: '2%', right: '6%', width: 132, height: 132, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 44px rgba(106,78,47,.3)', border: '5px solid #fff', animation: 'floatY 7s ease-in-out infinite' }}>
              <ProductImage imageKey="almonds.jpg" alt="Almonds" label="Almonds" />
            </div>
            <div data-float="1" style={{ position: 'absolute', bottom: '4%', left: '-2%', width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 24px 44px rgba(106,78,47,.3)', border: '5px solid #fff', animation: 'floatY2 9s ease-in-out infinite' }}>
              <ProductImage imageKey="pistachios.jpg" alt="Pistachios" label="Pistachios" />
            </div>
            <div data-float="1" style={{ position: 'absolute', bottom: '22%', right: '-3%', width: 112, height: 112, borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 38px rgba(106,78,47,.28)', border: '5px solid #fff', animation: 'floatY3 6s ease-in-out infinite' }}>
              <ProductImage imageKey="dates.jpeg" alt="Dates" label="Dates" />
            </div>
            <div style={{ position: 'absolute', top: '44%', left: '2%', background: '#fff', borderRadius: 16, padding: '12px 16px', boxShadow: '0 18px 36px rgba(106,78,47,.18)', display: 'flex', alignItems: 'center', gap: 10, animation: 'floatY3 8s ease-in-out infinite' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#EAF3DC', display: 'grid', placeItems: 'center', fontSize: 16 }}>🌿</span>
              <span style={{ lineHeight: 1.2 }}><b style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: '#6A4E2F' }}>No preservatives</b><br /><span style={{ fontSize: 11, color: '#8a7a63' }}>Ever. Guaranteed.</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section style={{ borderTop: '1px solid rgba(106,78,47,.1)', borderBottom: '1px solid rgba(106,78,47,.1)', background: '#fff' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '26px 32px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          {TRUST_BADGES.map((b) => (
            <Reveal key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 23 }}>{b.icon}</span>
              <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: 13, color: '#4a3a26', letterSpacing: '.02em' }}>{b.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 32px 40px' }}>
        <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }}>
          <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>CURATED COLLECTIONS</span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4vw,44px)', fontWeight: 700, color: '#2a1f12', margin: '14px 0 0' }}>Shop by category</h2>
          <p style={{ color: '#6c5c47', marginTop: 12, fontSize: 15.5 }}>Nine hand-picked collections, from everyday snacking to grand gifting.</p>
        </Reveal>
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {CATEGORIES.map((c) => {
            const count = products.filter((p) => p.category === c.name).length || 3;
            return (
              <Reveal key={c.name} as="button" style={{ position: 'relative', height: 230, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', border: 'none', padding: 0, boxShadow: '0 14px 34px rgba(106,78,47,.14)' }}>
                <div onClick={() => goShop(c.name)} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <ProductImage imageKey={c.image} alt={c.name} label={c.name + ' photo'} />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,20,12,.82) 6%, rgba(26,20,12,.15) 55%, transparent)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, textAlign: 'left', pointerEvents: 'none' }}>
                    <span style={{ display: 'block', fontSize: 24, marginBottom: 4 }}>{c.icon}</span>
                    <span style={{ display: 'block', fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 600, color: '#fff' }}>{c.name}</span>
                    <span style={{ display: 'block', fontFamily: "'Montserrat',sans-serif", fontSize: 11, letterSpacing: '.08em', color: '#e6d7b0', marginTop: 2 }}>{count} product{count === 1 ? '' : 's'} · SHOP →</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '72px 32px 40px' }}>
        <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>MOST LOVED</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4vw,44px)', fontWeight: 700, color: '#2a1f12', margin: '12px 0 0' }}>Best sellers</h2>
          </div>
          <button className="view-all-btn" onClick={() => goShop()} style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 600, fontSize: 13, background: 'none', border: '1.5px solid rgba(106,78,47,.3)', color: '#6A4E2F', padding: '12px 24px', borderRadius: 100, cursor: 'pointer' }}>View all products →</button>
        </Reveal>
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
          {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* PREMIUM BANNER */}
      <section style={{ maxWidth: 1360, margin: '88px auto 0', padding: '0 32px' }}>
        <Reveal style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', background: 'linear-gradient(120deg,#3f2e1a,#6A4E2F 60%,#7d5c34)', padding: '70px 60px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,175,55,.4),transparent 70%)' }} />
          <div style={{ position: 'relative' }}>
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, letterSpacing: '.24em', color: '#D4AF37', fontWeight: 600 }}>THE SIGNATURE GIFT</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4vw,46px)', fontWeight: 700, color: '#fff', margin: '16px 0 0', lineHeight: 1.1 }}>The Maharaja Box</h2>
            <p style={{ color: '#e8ddc9', fontSize: 16, lineHeight: 1.7, margin: '16px 0 0', maxWidth: 440 }}>Nine of our finest varieties, presented in a handcrafted keepsake box with gold-foil detailing. The gift that says everything.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 30 }}>
              <button className="gift-cta" onClick={() => navigate('/product/mixed')} style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, background: '#D4AF37', color: '#1A1A1A', border: 'none', padding: '16px 32px', borderRadius: 100, cursor: 'pointer', boxShadow: '0 14px 30px rgba(212,175,55,.35)', transition: 'transform .2s' }}>Gift the Maharaja →</button>
              <div style={{ color: '#fff' }}><span style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700 }}>₹2,499</span> <span style={{ textDecoration: 'line-through', color: '#c9b083', fontSize: 15 }}>₹3,200</span></div>
            </div>
          </div>
          <div style={{ position: 'relative', height: 280 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.35)', border: '5px solid rgba(255,255,255,.12)' }}>
              <ProductImage imageKey="gift-box.jpg" alt="Luxury gift box" label="Luxury gift box photo" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* HEALTH BENEFITS */}
      <section style={{ background: '#fff', marginTop: 88, borderTop: '1px solid rgba(106,78,47,.08)', borderBottom: '1px solid rgba(106,78,47,.08)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '88px 32px' }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 56px' }}>
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>WELLNESS IN EVERY BITE</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4vw,44px)', fontWeight: 700, color: '#2a1f12', margin: '14px 0 0' }}>Nourishment, naturally</h2>
          </Reveal>
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
            {BENEFITS.map((b) => (
              <Reveal key={b.title} className="benefit-card" style={{ textAlign: 'center', padding: '34px 22px', borderRadius: 20, background: '#FFFDF8', border: '1px solid rgba(106,78,47,.08)', transition: 'transform .3s, box-shadow .3s' }}>
                <div style={{ width: 70, height: 70, margin: '0 auto 18px', borderRadius: '50%', background: 'linear-gradient(135deg,#EAF3DC,#d9ecbf)', display: 'grid', placeItems: 'center', fontSize: 30 }}>{b.icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: '#6A4E2F' }}>{b.stat}</div>
                <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 600, color: '#3a2c1a', marginTop: 4 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: '#8a7a63', marginTop: 8, lineHeight: 1.55 }}>{b.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '92px 32px' }}>
        <Reveal style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 20px' }}>
          <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, letterSpacing: '.24em', color: '#B08D3E', fontWeight: 600 }}>FROM OUR FAMILY OF 40,000+</span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4vw,44px)', fontWeight: 700, color: '#2a1f12', margin: '14px 0 0' }}>Loved &amp; trusted</h2>
        </Reveal>
        <div style={{ position: 'relative', maxWidth: 820, margin: '40px auto 0', textAlign: 'center', minHeight: 230 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 90, color: '#e4d3a6', lineHeight: 0, height: 40 }}>&ldquo;</div>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 26, lineHeight: 1.5, color: '#3a2c1a', transition: 'opacity .4s' }}>{TESTIMONIALS[activeTesti].text}</p>
          <div style={{ marginTop: 24, color: '#D4AF37', fontSize: 16, letterSpacing: '3px' }}>★★★★★</div>
          <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, color: '#6A4E2F', marginTop: 12 }}>{TESTIMONIALS[activeTesti].name}</div>
          <div style={{ fontSize: 12.5, color: '#8a7a63' }}>{TESTIMONIALS[activeTesti].location} · <span style={{ color: '#8BC34A' }}>✓ Verified buyer</span></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 26 }}>
            {TESTIMONIALS.map((t, i) => (
              <button key={t.name} onClick={() => setActiveTesti(i)} style={{ width: i === activeTesti ? 28 : 8, height: 8, borderRadius: 100, border: 'none', cursor: 'pointer', transition: '.3s', background: i === activeTesti ? '#6A4E2F' : '#d8c9ac' }} />
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '0 32px 40px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 34 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#2a1f12' }}>@freshdryfruits</h2>
          <p style={{ color: '#8a7a63', fontSize: 14, marginTop: 6 }}>Tag us to be featured — real tables, real moments.</p>
        </Reveal>
        <div className="grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
          {INSTAGRAM_IMAGES.map((img, i) => (
            <div key={i} className="insta-tile" style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}>
              <ProductImage imageKey={img} alt="Instagram post" label="IG" />
              <div className="insta-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(106,78,47,0)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22, opacity: 0, transition: '.3s' }}>♡</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ maxWidth: 1360, margin: '60px auto 100px', padding: '0 32px' }}>
        <Reveal style={{ background: 'linear-gradient(120deg,#FFF6E3,#FDEFD0)', border: '1px solid rgba(212,175,55,.35)', borderRadius: 28, padding: 56, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 700, color: '#2a1f12' }}>Join the inner circle</h2>
          <p style={{ color: '#6c5c47', fontSize: 15.5, margin: '12px auto 0', maxWidth: 480 }}>Seasonal drops, private harvest sales &amp; a recipe every fortnight. Plus 10% off your first order.</p>
          <form onSubmit={onSubscribe} style={{ display: 'flex', gap: 10, maxWidth: 460, margin: '28px auto 0' }}>
            <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} type="email" required placeholder="your@email.com" style={{ flex: 1, border: '1.5px solid rgba(106,78,47,.25)', background: '#fff', borderRadius: 100, padding: '15px 22px', fontFamily: "'Poppins',sans-serif", fontSize: 14, outline: 'none', color: '#3a2c1a' }} />
            <button type="submit" style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, background: '#6A4E2F', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: 100, cursor: 'pointer', whiteSpace: 'nowrap' }}>{subLabel}</button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}
