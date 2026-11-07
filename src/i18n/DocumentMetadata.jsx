import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "./useTranslation.js";
import { updateDocumentMetadata } from "./documentMetadata.js";

export default function DocumentMetadata() {
  const { locale } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    updateDocumentMetadata(locale, pathname, document);
  }, [locale, pathname]);

  return null;
}
