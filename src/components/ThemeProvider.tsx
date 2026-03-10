'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';
type ColorScheme = 'gold' | 'dusk';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colorScheme: 'gold',
  toggleTheme: () => {},
  setColorScheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('gold');
  const [mounted, setMounted] = useState(false);

  // Beim Laden: gespeichertes Theme + Farbschema lesen
  useEffect(() => {
    const storedTheme = localStorage.getItem('souleya-theme') as Theme | null;
    const storedColor = localStorage.getItem('souleya-color') as ColorScheme | null;

    // Theme
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }

    // Farbschema
    if (storedColor === 'gold' || storedColor === 'dusk') {
      setColorSchemeState(storedColor);
      document.documentElement.setAttribute('data-color', storedColor);
    } else {
      document.documentElement.setAttribute('data-color', 'gold');
    }

    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('souleya-theme', next);
      return next;
    });
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    document.documentElement.setAttribute('data-color', scheme);
    localStorage.setItem('souleya-color', scheme);
  }, []);

  // SSR: data-theme auf dark setzen um Flash zu vermeiden
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
