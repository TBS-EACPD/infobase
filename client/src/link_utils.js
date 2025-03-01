import _ from "lodash";

import { infographic_href_template } from "./infographic/infographic_href_template";
import { glossaryEntryStore } from "./models/glossary";
import { is_subject_instance } from "./models/subjects";
import { rpb_link } from "./rpb/rpb_link";
import { Table } from "./tables/TableClass";

const glossary_href = (subject_or_id, first_character = "#") => {
  const id = _.isString(subject_or_id) ? subject_or_id : subject_or_id.id;
  const is_valid_glossary_item = glossaryEntryStore.has(id);

  if (is_valid_glossary_item) {
    return `${first_character}glossary/${id}`;
  }
};

const smart_href_template = (entity, first_character) => {
  if (entity.table && entity.table.constructor === Table) {
    return rpb_link({ table: entity.table.id }, first_character);
  } else if (entity.constructor === glossaryEntryStore) {
    return glossary_href(entity, first_character);
  } else if (
    is_subject_instance(entity) ||
    (entity?.__typename && entity?.subject_type)
  ) {
    return infographic_href_template(entity, null, {}, first_character);
  } else {
    throw new Error(
      `${entity} does not belong to a class with a known href template`
    );
  }
};

export {
  infographic_href_template,
  rpb_link,
  glossary_href,
  smart_href_template,
};
