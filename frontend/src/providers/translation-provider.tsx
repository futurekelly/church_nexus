"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import en from "../locales/en.json";
import sw from "../locales/sw.json";

export type Language = string;

// Registry of translation dictionaries to support future languages without provider changes
const dictionaryRegistry: Record<Language, Record<string, any>> = {
  en,
  sw,
};

interface TranslationContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  isReady: boolean;
  supportedLanguages: string[];
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = "church-settings-localization";

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);

  // Sync state with localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.default_language && dictionaryRegistry[parsed.default_language]) {
            setLanguageState(parsed.default_language);
          }
        } catch (e) {
          console.error("Error parsing localization settings", e);
        }
      }
    }
  }, []);

  // Listen to custom localStorage updates
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    const handleStorageUpdate = (e: any) => {
      if (e.detail?.key === LOCAL_STORAGE_KEY) {
        const val = e.detail.newValue;
        if (val?.default_language && dictionaryRegistry[val.default_language]) {
          setLanguageState(val.default_language);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        try {
          const val = e.newValue ? JSON.parse(e.newValue) : null;
          if (val?.default_language && dictionaryRegistry[val.default_language]) {
            setLanguageState(val.default_language);
          }
        } catch (err) {
          console.error("Error parsing storage change", err);
        }
      }
    };

    window.addEventListener("local-storage-update" as any, handleStorageUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("local-storage-update" as any, handleStorageUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isMounted]);

  const setLanguage = useCallback((lang: Language) => {
    if (!dictionaryRegistry[lang]) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Translation] Attempted to set unsupported language: "${lang}"`);
      }
      return;
    }
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      let current = {};
      if (stored) {
        try {
          current = JSON.parse(stored);
        } catch (e) {}
      }
      const updated = { ...current, default_language: lang };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("local-storage-update", {
          detail: { key: LOCAL_STORAGE_KEY, newValue: updated },
        })
      );
    }
  }, []);

  const t = useCallback(
    (keyPath: string, variables?: Record<string, string | number>): string => {
      // During SSR and initial hydration, default to "en" to prevent hydration warning
      const activeLang = isMounted ? language : "en";
      
      const keys = keyPath.split(".");
      let obj: any = dictionaryRegistry[activeLang];
      
      for (const key of keys) {
        if (obj && typeof obj === "object" && key in obj) {
          obj = obj[key];
        } else {
          obj = undefined;
          break;
        }
      }

      // Fallback to English if not found in the active language
      if (obj === undefined && activeLang !== "en") {
        let fallbackObj: any = dictionaryRegistry["en"];
        for (const key of keys) {
          if (fallbackObj && typeof fallbackObj === "object" && key in fallbackObj) {
            fallbackObj = fallbackObj[key];
          } else {
            fallbackObj = undefined;
            break;
          }
        }
        obj = fallbackObj;
      }

      // Development-only warning for missing translation keys
      if (obj === undefined && process.env.NODE_ENV !== "production") {
        console.warn(`[Translation] Missing key path: "${keyPath}" for language "${activeLang}"`);
      }

      // If key is not found anywhere, return the key path
      if (obj === undefined || typeof obj !== "string") {
        return keyPath;
      }

      let result = obj;
      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          result = result.replace(new RegExp(`{${k}}`, "g"), String(v));
        });
      }

      return result;
    },
    [language, isMounted]
  );

  const supportedLanguages = Object.keys(dictionaryRegistry);

  return (
    <TranslationContext.Provider
      value={{ language, setLanguage, t, isReady: isMounted, supportedLanguages }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
