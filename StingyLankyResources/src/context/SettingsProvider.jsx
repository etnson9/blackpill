import { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    // Theme setup
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // NSFW setup
    const storedNSFW = localStorage.getItem('showNSFW');
    if (storedNSFW === 'true') {
      setShowNSFW(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newIsDark = !prev;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newIsDark;
    });
  };

  const toggleNSFW = () => {
    setShowNSFW(prev => {
      const newShowNSFW = !prev;
      localStorage.setItem('showNSFW', newShowNSFW);
      return newShowNSFW;
    });
  };

  return (
    <SettingsContext.Provider value={{ isDarkMode, toggleTheme, showNSFW, toggleNSFW }}>
      {children}
    </SettingsContext.Provider>
  );
};