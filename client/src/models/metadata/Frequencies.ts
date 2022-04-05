import { lang } from "src/core/injected_build_constants";

import { InferedKeysRecordHelper } from "src/types/type_utils";

export const Frequencies = InferedKeysRecordHelper<string>()({
  yearly: { en: "Yearly", fr: "Annuellement" }[lang],
  quarterly: { en: "Quarterly", fr: "Trimestriellement" }[lang],
  mothly: { en: "Monthly", fr: "Mensuellement" }[lang],
  as_needed: { en: "As needed", fr: "Comme requis" }[lang],
});
