import { createContext, useContext, useState } from 'react';

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [quickId, setQuickId] = useState(null);
  return (
    <QuickViewContext.Provider value={{ quickId, open: (id) => setQuickId(id), close: () => setQuickId(null) }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  return useContext(QuickViewContext);
}
