import { useContext } from "react";
import { LocaleContext } from "./LocaleContext.js";

export function useTranslation() {
  return useContext(LocaleContext);
}
