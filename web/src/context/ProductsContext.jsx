import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function bySlug(id) {
    return products.find((p) => p.id === id);
  }

  return (
    <ProductsContext.Provider value={{ products, loading, error, bySlug }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
