"use strict";
exports = module.exports;

require("./glossary.ib.yaml");
const {autoComplete} = require('../search/search.js');
const ROUTER = require('../core/router.js');
const {text_maker} = require('../models/text');
const {GlossaryEntry} = require('../models/glossary.js');
const { glossary: glossary_search_config } = require('../search/search_configs.js');


function scrollToItem(key){
  if (!_.isEmpty(key) && key !== "__"){
    var el = document.querySelector("#"+key);
    if (el){
      scrollTo(0,el.offsetTop);
      setTimeout(()=>{ 
        el.focus(); 
      });
    }
  }
}


// add linke for glossary with a key to scroll too
ROUTER.add_container_route("glossary/:key:", "glossary-key", function glossary(container,key) {
  // if key is undefined, then the page won't attempt to scroll
  this.add_crumbs([{html: text_maker("glossary")}]);
  this.add_title("glossary");
  
  const glossary_items = GlossaryEntry.fully_defined_entries;

  const glossary_items_by_letter = _.chain(glossary_items)
    .groupBy(item => {
      const first_letter = item.title[0];
      if (_.includes(["É","È","Ê","Ë"],first_letter)){
        return "E";
      }
      return first_letter;
    })
    .map( (items, letter)=> ({ items, letter}) )
    .sortBy('letter')
    .value();

  container.innerHTML = text_maker('glossary_t', {
    glossary_items_by_letter,
  });

  scrollToItem(key);
  
    
  autoComplete({
    container: container.querySelector('#glossary_search'),
    placeholder: text_maker('glossary_search'),
    search_configs: [ glossary_search_config ],
    onSelect: (item => { scrollToItem(item.id); } ),
    minLength: 4,
  });

});
