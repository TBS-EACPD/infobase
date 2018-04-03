const { infograph_href_template } = require('./infographic/routes.js')

const { rpb_link } = require('./rpb/rpb_link.js');
const { Table } = require('./core/TableClass.js');
const { GlossaryEntry } = require('./models/glossary.js');

const glossary_href = glossary_item => "#glossary/"+glossary_item.id;

const general_href_for_item = item => {

  if(item.level){ //subject entity

    return infograph_href_template(item, null, true);

  } else if(item.table && item.table.constructor === Table){

    return rpb_link({ table: item.table.id });

  } else if(item.constructor === GlossaryEntry){
    return glossary_href(item);
  }

}


module.exports = {
  infograph_href_template,
  rpb_link,
  glossary_href,
  general_href_for_item,
};
  
