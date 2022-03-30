import _ from "lodash";

import { DataSources } from "src/models/metadata/DataSources";
import type { DataSourceKey } from "src/models/metadata/DataSources";

export const get_source_link = (key: DataSourceKey) => {
  const source = DataSources[key];
  return {
    html: source.name,
    href: `#datasets/${source.key}`,
  };
};

export const get_source_links = (source_keys: (keyof typeof DataSources)[]) =>
  _.chain(source_keys).map(get_source_link).compact().value();
