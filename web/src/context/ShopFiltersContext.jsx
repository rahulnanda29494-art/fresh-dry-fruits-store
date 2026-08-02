import { createContext, useContext, useState } from 'react';

const ShopFiltersContext = createContext(null);

const DEFAULTS = { search: '', fCats: [], fMax: 2000, fOrganic: false, fRating: 0, sort: 'popular' };

export function ShopFiltersProvider({ children }) {
  const [search, setSearch] = useState(DEFAULTS.search);
  const [fCats, setFCats] = useState(DEFAULTS.fCats);
  const [fMax, setFMax] = useState(DEFAULTS.fMax);
  const [fOrganic, setFOrganic] = useState(DEFAULTS.fOrganic);
  const [fRating, setFRating] = useState(DEFAULTS.fRating);
  const [sort, setSort] = useState(DEFAULTS.sort);

  function toggleCat(cat) {
    setFCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  function setCategoryOnly(cat) {
    setFCats([cat]);
  }

  function clearFilters() {
    setFCats(DEFAULTS.fCats);
    setFMax(DEFAULTS.fMax);
    setFOrganic(DEFAULTS.fOrganic);
    setFRating(DEFAULTS.fRating);
    setSearch(DEFAULTS.search);
  }

  return (
    <ShopFiltersContext.Provider value={{
      search, setSearch, fCats, toggleCat, setCategoryOnly, fMax, setFMax,
      fOrganic, setFOrganic, fRating, setFRating, sort, setSort, clearFilters,
    }}>
      {children}
    </ShopFiltersContext.Provider>
  );
}

export function useShopFilters() {
  return useContext(ShopFiltersContext);
}
