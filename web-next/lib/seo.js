// Self-referencing hreflang alternates for the (English) site.
// Each page points to its own URL for en, en-IN and x-default.
export const altLanguages = (path = '/') => ({
  en: path,
  'en-IN': path,
  'x-default': path,
});

export default altLanguages;
