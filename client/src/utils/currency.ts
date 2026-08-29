export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateFromUSD: number; // Conversion multiplier relative to base USD price
}

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  US: { code: 'USD', symbol: '$', rateFromUSD: 1 },
  IN: { code: 'INR', symbol: '₹', rateFromUSD: 83 },
  GB: { code: 'GBP', symbol: '£', rateFromUSD: 0.79 },
  EU: { code: 'EUR', symbol: '€', rateFromUSD: 0.92 },
  DEFAULT: { code: 'USD', symbol: '$', rateFromUSD: 1 },
};

export const formatPriceByLocation = (
  basePriceUSD: number,
  countryCode: string = 'US'
): string => {
  const config = COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || COUNTRY_CURRENCY_MAP.DEFAULT;
  const converted = Math.round(basePriceUSD * config.rateFromUSD);

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits: 0,
  }).format(converted);
};