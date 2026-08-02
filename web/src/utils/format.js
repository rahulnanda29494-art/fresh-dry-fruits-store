export function money(n) {
  return '₹' + n.toLocaleString('en-IN');
}

export function stars(rating) {
  const full = Math.round(rating);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}
