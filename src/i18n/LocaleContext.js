import { createContext } from "react";
import { createTranslator } from "./translate.js";

export const LocaleContext = createContext({
  locale: "en",
  t: createTranslator("en"),
  setLocale: () => {},
  isLocalePersistenceAvailable: true,
});
