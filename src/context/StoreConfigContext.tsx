"use client";

import { createContext, useContext } from "react";

interface StoreConfig {
  transferDiscountPercent: number;
  installmentsCount: number;
}

const StoreConfigContext = createContext<StoreConfig>({
  transferDiscountPercent: 0,
  installmentsCount: 0,
});

export function StoreConfigProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: StoreConfig;
}) {
  return (
    <StoreConfigContext.Provider value={value}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  return useContext(StoreConfigContext);
}
