import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useShopFilters } from '../context/ShopFiltersContext';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../data/categories';
import { money } from '../utils/format';

const RATING_OPTIONS = [4.5, 4, 3, 0];

export default function Shop() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const f = useShopFilters();

  let shopList = products.filter((p) => {
    if (f.fCats.length && !f.fCats.includes(p.category)) return false;
    if (p.price > f.fMax) return false;
    if (f.fOrganic && !p.organic) return false;
    if (p.rating < f.fRating) return false;
    if (f.search.trim() && !p.name.toLowerCase().includes(f.search.trim().toLowerCase())) return false;
    return true;
  });
  if (f.sort === 'price-low') shopList = [...shopList].sort((a, b) => a.price - b.price);
  else if (f.sort === 'price-high') shopList = [...shopList].sort((a, b) => b.price - a.price);
  else if (f.sort === 'rating') shopList = [...shopList].sort((a, b) => b.rating - a.rating);

  return (
    <div>
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(106,78,47,.1)', padding: '44px 32px' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto' }}>
          <div style={{ fontSize: 12.5, color: '#8a7a63' }}><a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a> / <span style={{ color: '#6A4E2F' }}>Shop</span></div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 700, color: '#2a1f12', marginTop: 10 }}>Shop All</h1>
          <p style={{ color: '#8a7a63', fontSize: 14.5, marginTop: 6 }}>{shopList.length} products found</p>
        </div>
      </section>
      <section className="shop-layout" style={{ maxWidth: 1360, margin: '0 auto', padding: '44px 32px 100px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'start' }}>
        <aside className="shop-sidebar" style={{ background: '#fff', border: '1px solid rgba(106,78,47,.1)', borderRadius: 20, padding: 24, position: 'sticky', top: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: 13, color: '#2a1f12', letterSpacing: '.04em' }}>FILTERS</span>
            <button onClick={f.clearFilters} style={{ background: 'none', border: 'none', color: '#B08D3E', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
          </div>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 12, color: '#4a3a26', margin: '18px 0 10px' }}>CATEGORY</div>
          {CATEGORIES.map((c) => (
            <label key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13.5, color: '#4a3a26', cursor: 'pointer' }}>
              <input type="checkbox" checked={f.fCats.includes(c.name)} onChange={() => f.toggleCat(c.name)} style={{ width: 16, height: 16, accentColor: '#6A4E2F' }} />{c.name}
            </label>
          ))}
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 12, color: '#4a3a26', margin: '20px 0 10px' }}>MAX PRICE: {money(f.fMax)}</div>
          <input type="range" min="300" max="2000" step="50" value={f.fMax} onChange={(e) => f.setFMax(Number(e.target.value))} style={{ width: '100%', accentColor: '#6A4E2F' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontSize: 13.5, color: '#4a3a26', cursor: 'pointer' }}>
            <input type="checkbox" checked={f.fOrganic} onChange={() => f.setFOrganic((v) => !v)} style={{ width: 16, height: 16, accentColor: '#6A4E2F' }} /> 🌿 Organic only
          </label>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 600, fontSize: 12, color: '#4a3a26', margin: '20px 0 10px' }}>MIN RATING</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {RATING_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => f.setFRating(r)}
                style={{
                  border: '1.5px solid ' + (f.fRating === r ? '#6A4E2F' : 'rgba(106,78,47,.2)'),
                  background: f.fRating === r ? '#6A4E2F' : '#fff',
                  color: f.fRating === r ? '#fff' : '#4a3a26',
                  borderRadius: 100, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Montserrat,sans-serif',
                }}
              >
                {r === 0 ? 'Any' : r + '★+'}
              </button>
            ))}
          </div>
        </aside>
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
            <select value={f.sort} onChange={(e) => f.setSort(e.target.value)} style={{ border: '1px solid rgba(106,78,47,.2)', borderRadius: 100, padding: '11px 18px', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#4a3a26', background: '#fff', cursor: 'pointer' }}>
              <option value="popular">Sort: Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          {shopList.length > 0 ? (
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
              {shopList.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8a7a63' }}>
              <div style={{ fontSize: 44 }}>🔍</div>
              <p style={{ marginTop: 14, fontSize: 15 }}>No products match your filters.</p>
              <button onClick={f.clearFilters} style={{ marginTop: 14, fontFamily: 'Montserrat,sans-serif', fontWeight: 600, background: '#6A4E2F', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 100, cursor: 'pointer' }}>Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
