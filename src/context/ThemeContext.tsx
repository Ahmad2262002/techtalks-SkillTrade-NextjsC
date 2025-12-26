"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = "light" | "dark";
export type Accent = "default" | "sunset" | "emerald" | "ocean" | "midnight";

interface ThemeContextType {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accent, setAccent] = useState<Accent>('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedAccent = localStorage.getItem('accent') as Accent | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

    setTheme(storedTheme || preferredTheme);
    setAccent(storedAccent || 'default');
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Theme
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    // Accent
    const allAccents: Accent[] = ['default', 'sunset', 'emerald', 'ocean', 'midnight'];
    allAccents.forEach(a => root.classList.remove(`accent-${a}`));
    root.classList.add(`accent-${accent}`);

    localStorage.setItem('theme', theme);
    localStorage.setItem('accent', accent);
  }, [theme, accent]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};