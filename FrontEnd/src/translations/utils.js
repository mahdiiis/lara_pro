export const useTranslation = (translations, language) => {
  const t = (key) => {
    const keys = key.split(".");
    let result = translations[language];

    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        return key; // Return original key if not found
      }
    }

    return result || key;
  };

  return { t };
};
