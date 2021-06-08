import { shouldPolyfill as should_polyfill_numberformat } from "@formatjs/intl-numberformat/should-polyfill";

import { lang } from "src/core/injected_build_constants";

async function intl_numberfotmat() {
  if (!should_polyfill_numberformat()) {
    return;
  }

  await import("@formatjs/intl-numberformat/polyfill");

  if (lang === "fr") {
    await import("@formatjs/intl-numberformat/locale-data/fr");
  } else {
    await import("@formatjs/intl-numberformat/locale-data/en");
  }
}

export const runtime_polyfills = () => Promise.all([intl_numberfotmat]);
