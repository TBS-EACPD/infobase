import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

import { Frequencies } from "./Frequencies";

type SourceDef = {
  name: string;
  description: React.ReactNode;
  frequency_key?: keyof typeof Frequencies;
  bilingual_links?: { text: string; href: { [key in LangType]: string } }[];
};

export type SourceKeys = "test" | "etc"; // TODO

const source_definitions: { [key in SourceKeys]: SourceDef } = {
  // TODO
  test: { name: "", description: "" },
  etc: { name: "", description: "" },
};

export const DataSources = _.mapValues(source_definitions, (def: SourceDef) => {
  const { frequency_key, bilingual_links } = def;

  const frequency =
    frequency_key !== undefined ? Frequencies[frequency_key] : undefined;

  const links = _.map(bilingual_links, ({ text, href }) => ({
    text,
    href: href[lang],
  }));

  return { ...def, frequency, links };
});
