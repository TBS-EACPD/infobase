import _ from "lodash";

import { DataSources } from "src/models/metadata/Sources";
import type { DataSourceKey } from "src/models/metadata/Sources";

export const get_source_link = (key: DataSourceKey) => {
  const source = DataSources[key];

  if (_.isUndefined(source)) {
    throw new Error(`"${key}" is not a valid data source key`);
  }

  return {
    html: source.name,
    href: `#datasets/${key}`,
  };
};

export const get_source_links = (source_keys: (keyof typeof DataSources)[]) =>
  _.map(source_keys, get_source_link);
