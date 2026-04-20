// Reference installment rates for Argentina (approximate, vary by card/bank)
const INSTALLMENT_RATES: Record<number, number> = {
  3:  1.10,
  6:  1.28,
  9:  1.48,
  12: 1.68,
};

export interface InstallmentOption {
  count: number;
  monthlyAmount: number;
  total: number;
}

export function getInstallmentOptions(price: number): InstallmentOption[] {
  return Object.entries(INSTALLMENT_RATES).map(([count, multiplier]) => {
    const total = Math.round(price * multiplier);
    const monthly = Math.round(total / Number(count));
    return { count: Number(count), monthlyAmount: monthly, total };
  });
}
