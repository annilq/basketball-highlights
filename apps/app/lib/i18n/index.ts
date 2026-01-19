import type { ReactNode } from "react";
import React, { createContext, use, useState } from "react";
import { enTranslations } from "./translations/en";
import { zhTranslations } from "./translations/zh";
import type { I18nContextType, Locale, Translations } from "./types";

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  zh: zhTranslations,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("en");

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (typeof value !== "object" || value === null || !(k in value)) {
        return key;
      }
      value = (value as Record<string, unknown>)[k];
    }

    if (typeof value !== "string") {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        // Handle pluralization for English hours
        if (paramKey === "count" && locale === "en") {
          const pluralizedValue = paramValue === 1 ? "hour" : "hours";
          return acc.replace(`hour{{count}}`, pluralizedValue);
        }
        return acc.replace(`{{${paramKey}}}`, String(paramValue));
      }, value);
    }

    return value;
  };

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    t,
  };

  return React.createElement(
    I18nContext.Provider,
    { value: contextValue },
    children,
  );
};

export const useI18n = () => {
  const context = use(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
