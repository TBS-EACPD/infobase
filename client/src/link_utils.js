import { infograph_href_template } from './infographic/routes.js';
import { rpb_link } from './rpb/rpb_link.js';
import { Table } from './core/TableClass.js';
import { GlossaryEntry } from './models/glossary.js';

const glossary_href = (subject_or_id, first_character = '#') => {
  const id = _.isString(subject_or_id) ? subject_or_id : subject_or_id.id;
  const is_valid_glossary_item = !_.isUndefined( GlossaryEntry.lookup(id) );

  return is_valid_glossary_item && `${first_character}glossary/${id}`;
};

const general_href_for_item = item => {
  if(item.level){
    return infograph_href_template(item, null, '/');
  } else if(item.table && item.table.constructor === Table){
    return rpb_link({ table: item.table.id }, '/');
  } else if(item.constructor === GlossaryEntry){
    return glossary_href(item, '/');
  }
};

export {
  infograph_href_template,
  rpb_link,
  glossary_href,
  general_href_for_item,
};
