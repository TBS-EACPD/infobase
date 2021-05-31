import { lang } from "src/core/injected_build_constants";

// legacy, these config constants should now primarily come from the API along with the data (and will vary by year),
// drop them once we get the chance to rewrite the current set of FAQs which are the only place still using them
// (until then, remember to manually update them!)
export const COVID_DATE_LAST_UPDATED = {
  en: "April 30, 2021",
  fr: "30 avril 2021",
}[lang];
