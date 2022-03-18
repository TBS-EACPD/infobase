import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

import type { SourceKey } from "./DataSources";
import { DataSources } from "./DataSources";

import { Frequencies } from "./Frequencies";

type DataSetDef = {
  name: string;
  source_key: SourceKey;
  open_data_link?: string;
  other_links?: { text: string; href: { [key in LangType]: string } }[];
  frequency_key?: keyof typeof Frequencies;
};

const data_set_definitions: Record<string, DataSetDef> = {
  test: { name: "", source_key: "test" },
};

export const DataSets = _.mapValues(
  data_set_definitions,
  (def: DataSetDef, key) => {
    const { source_key, open_data_link, frequency_key } = def;

    const source = DataSources[source_key];

    if (source.open_data_link === undefined && open_data_link === undefined) {
      throw new Error(
        `The data set "${key}" has no open data link AND it's corresponding data source "${source_key}" also has no link. ` +
          "It is an assumption of the InfoBase that all data we publish also exists somewhere on open data (as a standalone dataset " +
          "or on a source-wide shared Open Data page)."
      );
    }

    const frequency =
      frequency_key !== undefined ? Frequencies[frequency_key] : undefined;

    return { ...def, source, frequency };
  }
);
