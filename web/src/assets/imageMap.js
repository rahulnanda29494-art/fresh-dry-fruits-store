import almonds from './images/almonds.jpg';
import cashews from './images/cashews.jpg';
import pistachios from './images/pistachios.jpg';
import walnuts from './images/walnuts.jpeg';
import dates from './images/dates.jpeg';
import raisins from './images/raisins.jpeg';
import figs from './images/figs.jpeg';
import giftBox from './images/gift-box.jpg';
// Editorial photos (Unsplash license — free for commercial use, no attribution)
import aboutHero from './images/about-hero.jpg';
import founder from './images/founder.jpg';
import farm1 from './images/farm-1.jpg';
import farm2 from './images/farm-2.jpg';
import farm3 from './images/farm-3.jpg';
import farm4 from './images/farm-4.jpg';

// Products carry a logical image key from the API; this resolves it to the
// bundled asset. A product with no photo yet (apricots) resolves to
// undefined and callers fall back to <PlaceholderImage>.
const MAP = {
  'almonds.jpg': almonds,
  'cashews.jpg': cashews,
  'pistachios.jpg': pistachios,
  'walnuts.jpeg': walnuts,
  'dates.jpeg': dates,
  'raisins.jpeg': raisins,
  'figs.jpeg': figs,
  'gift-box.jpg': giftBox,
  'about-hero.jpg': aboutHero,
  'founder.jpg': founder,
  'farm-1.jpg': farm1,
  'farm-2.jpg': farm2,
  'farm-3.jpg': farm3,
  'farm-4.jpg': farm4,
};

export function resolveImage(key) {
  return MAP[key];
}
