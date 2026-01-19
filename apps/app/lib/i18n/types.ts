export type Locale = "en" | "zh";

export interface Translations {
  [key: string]: string | Translations;
}

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}
