import { resolveImage } from '../assets/imageMap';

const stripes = {
  backgroundImage: 'repeating-linear-gradient(135deg, #F0EADF, #F0EADF 10px, #F5EFE2 10px, #F5EFE2 20px)',
};

export default function ProductImage({ imageKey, alt, label, style, fit = 'cover' }) {
  const src = resolveImage(imageKey);
  if (!src) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', ...stripes, ...style }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#a08a63', textAlign: 'center', padding: '0 12px', letterSpacing: '.02em' }}>
          {label || alt || 'Product photo'}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || ''}
      style={{ width: '100%', height: '100%', objectFit: fit, display: 'block', ...style }}
    />
  );
}
