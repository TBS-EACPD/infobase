import _ from "lodash";

import { Table } from "./core/TableClass";
import { infograph_href_template } from "./infographic/infographic_link";
import { GlossaryEntry } from "./models/glossary";
import { Subject } from "./models/subject";
import { rpb_link } from "./rpb/rpb_link";

const { Gov, Dept, CRSO, Program, Tag } = Subject;
const subject_classes_with_infographics = [
  Gov.constructor,
  Dept,
  CRSO,
  Program,
  Tag,
];

const glossary_href = (subject_or_id, first_character = "#") => {
  const id = _.isString(subject_or_id) ? subject_or_id : subject_or_id.id;
  const is_valid_glossary_item = !_.isUndefined(GlossaryEntry.lookup(id));

  if (is_valid_glossary_item) {
    return `${first_character}glossary/${id}`;
  }
};

const smart_href_template = (entity, first_character) => {
  if (entity.table && entity.table.constructor === Table) {
    return rpb_link({ table: entity.table.id }, first_character);
  } else if (entity.constructor === GlossaryEntry) {
    return glossary_href(entity, first_character);
  } else if (
    _.includes(subject_classes_with_infographics, entity.constructor)
  ) {
    return infograph_href_template(entity, null, first_character);
  } else {
    throw new Error(
      `${entity} does not belong to a class with a known href template`
    );
  }
};

export {
  infograph_href_template,
  rpb_link,
  glossary_href,
  smart_href_template,
};
