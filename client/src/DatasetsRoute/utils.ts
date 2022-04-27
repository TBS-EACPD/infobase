import _ from "lodash";

import { Sources } from "src/models/metadata/Sources";
import type { SourceKey } from "src/models/metadata/Sources";

export const get_source_link = (key: SourceKey) => {
  const source = Sources[key];

  if (_.isUndefined(source)) {
    throw new Error(`"${key}" is not a valid data source key`);
  }

  return {
    html: source.name,
    href: `#datasets/${key}`,
  };
};

export const get_source_links = (source_keys: (keyof typeof Sources)[]) =>
  _.map(source_keys, get_source_link);
