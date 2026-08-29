import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocationContextType {
  countryCode: string;
  city: string;
  isLoading: boolean;
  detectLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  countryCode: 'US',
  city: '',
  isLoading: false,
  detectLocation: async () => {},
});

const LOCATION_CACHE_KEY = 'user_location_cache';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryCode, setCountryCode] = useState<string>('US');
  const [city, setCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const detectLocation = async () => {
    // 1. Check localStorage cache first
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.countryCode) {
          setCountryCode(parsed.countryCode);
          setCity(parsed.city || '');
          return;
        }
      }
    } catch {
      // Ignore cache read errors
    }

    setIsLoading(true);
    try {
      // 2. Free, reliable endpoint with higher rate limit
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success !== false && data.country_code) {
          setCountryCode(data.country_code);
          setCity(data.city || '');
          localStorage.setItem(
            LOCATION_CACHE_KEY,
            JSON.stringify({ countryCode: data.country_code, city: data.city || '' })
          );
          return;
        }
      }
      throw new Error('API lookup failed');
    } catch {
      // 3. Fallback to browser locale
      const userLocale = navigator.language || 'en-US';
      const fallbackCountry = userLocale.split('-')[1] || 'US';
      setCountryCode(fallbackCountry);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ countryCode, city, isLoading, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);