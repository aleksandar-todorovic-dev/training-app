import { useCallback, useMemo, useState } from "react";
import { LocaleContext } from "./LocaleContext.js";
import { loadLocale, normalizeLocale, saveLocale } from "./localeStorage.js";
import { createTranslator } from "./translate.js";

export function LocaleProvider({ children }) {
  const [locale, updateLocale] = useState(loadLocale);
  const [isLocalePersistenceAvailable, setPersistenceAvailable] = useState(true);
  const t = useMemo(() => createTranslator(locale), [locale]);
  const setLocale = useCallback((nextLocale) => {
    const next = normalizeLocale(nextLocale);
    updateLocale(next);
    setPersistenceAvailable(saveLocale(next));
  }, []);

  const value = useMemo(() => ({ locale, t, setLocale, isLocalePersistenceAvailable }),
    [locale, t, setLocale, isLocalePersistenceAvailable]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
