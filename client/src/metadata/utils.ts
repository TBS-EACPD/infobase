import _ from "lodash";

import { DataSources } from "src/models/metadata/DataSources";

export const get_source_link = (source_key: keyof typeof DataSources) =>
  DataSources[source_key] && {
    html: DataSources[source_key].name,
    href: `#metadata/${source_key}`,
  };

export const get_source_links = (source_keys: (keyof typeof DataSources)[]) =>
  _.chain(source_keys).map(get_source_link).compact().value();
