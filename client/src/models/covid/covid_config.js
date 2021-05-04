import { lang } from "src/core/injected_build_constants.ts";

// temporary, for dev purposes. Can be dropped/cleaned up after when we finally publish expenditures
export const COVID_EXPENDITUES_FLAG = true;

// legacy, these config constants should now primarily come from the API along with the data (and will vary by year),
// drop them once we get the chance to rewrite the current set of FAQs which are the only place still using them
// (until then, remember to manually update them!)
export const COVID_DATE_LAST_UPDATED = {
  en: "March 31, 2021",
  fr: "31 mars 2021",
}[lang];
export const COVID_CURRENT_YEAR = 2020;
export const COVID_NEXT_YEAR = COVID_CURRENT_YEAR + 1;
