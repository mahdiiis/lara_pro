import { useContext } from "react";
import {
  LanguageContext,
  useLanguageContext,
} from "../context/LanguageContext";
import { translations } from "../translations";
import { useTranslation } from "../translations/utils";

export const useLanguage = () => {
  const { language, changeLanguage } = useLanguageContext();
  const { t } = useTranslation(translations, language);

  return { t, language, changeLanguage };
};
