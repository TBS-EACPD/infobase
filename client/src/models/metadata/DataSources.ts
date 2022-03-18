import _ from "lodash";

import { Frequencies } from "./Frequencies";

type SourceDef = {
  name: string;
  description: React.ReactNode;
  open_data_link?: string;
  other_links?: { text: string; href: string }[];
  frequency_key?: keyof typeof Frequencies;
};

export type SourceKey = "test" | "etc"; // TODO

const source_definitions: { [key in SourceKey]: SourceDef } = {
  // TODO
  test: { name: "", description: "" },
  etc: { name: "", description: "" },
};

export const DataSources = _.mapValues(source_definitions, (def: SourceDef) => {
  const { frequency_key } = def;

  const frequency =
    frequency_key !== undefined ? Frequencies[frequency_key] : undefined;

  return { ...def, frequency };
});
