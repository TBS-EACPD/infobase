import _ from "lodash";

import { DataSources } from "src/models/metadata/DataSources";
import type { DataSourceKey } from "src/models/metadata/DataSources";

export const data_source_legacy_key_map = _.chain(DataSources)
  .map(({ key, legacy_key }) => legacy_key && [legacy_key, key])
  .compact()
  .fromPairs()
  .value() as { [x: string]: DataSourceKey };

export const get_source_link = (key: string) => {
  const source = (() => {
    if (key in data_source_legacy_key_map) {
      return DataSources[data_source_legacy_key_map[key]];
    } else if (key in DataSources) {
      return DataSources[key as DataSourceKey];
    } else {
      throw new Error(
        `"${key}" is not a valid key, or legacy_key, for a DataSource`
      );
    }
  })();

  return {
    html: source.name,
    href: `#datasets/${source.key}`,
  };
};

export const get_source_links = (source_keys: (keyof typeof DataSources)[]) =>
  _.chain(source_keys).map(get_source_link).compact().value();
