import { useId } from "react";
import { useTranslation } from "../../i18n/useTranslation.js";

export default function LanguageSelector() {
  const { locale, t, setLocale, isLocalePersistenceAvailable } = useTranslation();
  const id = useId();

  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-[#AAB2BA]">
      <label htmlFor={id}>{t("Language")}</label>
      <select
        id={id}
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className="min-h-11 max-w-full rounded-lg border border-[#3A434C] bg-[#13181D] px-3 text-sm text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]"
      >
        <option value="en" lang="en">English</option>
        <option value="sr-Latn" lang="sr-Latn">Srpski</option>
      </select>
      {!isLocalePersistenceAvailable ? (
        <p className="w-full text-right text-[#F4C87F]" role="status">
          {t("Language changed for this visit. Your browser could not save the preference.")}
        </p>
      ) : null}
    </div>
  );
}
