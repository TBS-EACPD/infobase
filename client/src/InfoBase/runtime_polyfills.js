import { shouldPolyfill as should_polyfill_getcanonicallocales } from "@formatjs/intl-getcanonicallocales/should-polyfill";
import { shouldPolyfill as should_polyfill_locale } from "@formatjs/intl-locale/should-polyfill";
import { shouldPolyfill as should_polyfill_numberformat } from "@formatjs/intl-numberformat/should-polyfill";
import { shouldPolyfill as should_polyfill_pluralrules } from "@formatjs/intl-pluralrules/should-polyfill";

import { lang } from "src/core/injected_build_constants";

async function intl_getcanonicallocales() {
  if (should_polyfill_getcanonicallocales()) {
    await import("@formatjs/intl-getcanonicallocales/polyfill");
  }
}

async function intl_locale() {
  if (should_polyfill_locale()) {
    await import("@formatjs/intl-locale/polyfill");
  }
}

async function intl_pluralrules() {
  if (!should_polyfill_pluralrules()) {
    return;
  }

  await import("@formatjs/intl-pluralrules/polyfill");

  if (lang === "fr") {
    await import("@formatjs/intl-pluralrules/locale-data/fr");
  } else {
    await import("@formatjs/intl-pluralrules/locale-data/en");
  }
}

async function intl_numberformat() {
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

export const runtime_polyfills = () =>
  Promise.all([
    intl_getcanonicallocales(),
    intl_locale(),
    intl_pluralrules(),
    intl_numberformat(),
  ]);
