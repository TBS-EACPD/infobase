import JSURL from 'jsurl';

import { infograph_href_template } from './infographic/routes.js';
import { rpb_link } from './rpb/rpb_link.js';
import { Table } from './core/TableClass.js';
import { GlossaryEntry } from './models/glossary.js';

const glossary_href = (subject_or_id) => {
  const id = _.isString(subject_or_id) ? subject_or_id : subject_or_id.id;
  const is_valid_glossary_item = !_.isUndefined( GlossaryEntry.lookup(id) );

  return is_valid_glossary_item && `#glossary/${id}`;
};

const general_href_for_item = item => {

  if(item.level){ //subject entity

    return infograph_href_template(item, null, true);

  } else if(item.table && item.table.constructor === Table){

    return rpb_link({ table: item.table.id }, true);

  } else if(item.constructor === GlossaryEntry){
    return glossary_href(item);
  }

};

// JSURL's use of ~'s is problematic in a number of cases (users pasting links in to rich text editors supporting extended markdown for instance)
// This wraps JSURL and replaces ~'s with _.-._.-, but is also backwards compatible with old ~ using JSURL's
const SafeJSURL = {
  parse: (safe_jsurl_string) => _.isString(safe_jsurl_string) && JSURL.parse( safe_jsurl_string.replace(/_.-._.-/g, "~") ),
  stringify: (json) => JSURL.stringify(json).replace(/~/g, "_.-._.-"),
  tryParse: (safe_jsurl_string) => _.isString(safe_jsurl_string) && JSURL.tryParse( safe_jsurl_string.replace(/_.-._.-/g, "~") ),
};

export {
  infograph_href_template,
  rpb_link,
  glossary_href,
  general_href_for_item,
  SafeJSURL,
};
  
