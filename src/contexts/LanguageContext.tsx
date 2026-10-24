'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/types/menu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// initialLanguage: lingua della pagina del menu (/{slug}/{lingua}); altrove resta l'italiano
export function LanguageProvider({ children, initialLanguage = 'it' }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

