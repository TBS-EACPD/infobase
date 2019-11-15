import { PanelRegistry } from '../PanelRegistry.js';

const panel_loading_promises = (subject) => {
  switch(subject.level){
    case 'gov':
      return import(/* webpackChunkName: "gov_panels" */ './get_gov_panels.js').then( ({get_gov_panels}) => get_gov_panels(subject) );
    case 'dept':
      return import(/* webpackChunkName: "dept_panels" */ './get_dept_panels.js').then( ({get_dept_panels}) => get_dept_panels(subject) );
    case 'crso':
      return import(/* webpackChunkName: "crso_panels" */ './get_crso_panels.js').then( ({get_crso_panels}) => get_crso_panels(subject) );
    case 'tag':
      return import(/* webpackChunkName: "tag_panels" */ './get_tag_panels.js').then( ({get_tag_panels}) => get_tag_panels(subject) );
    case 'program':
      return import(/* webpackChunkName: "program_panels" */ './get_program_panels.js').then( ({get_program_panels}) => get_program_panels(subject) );
  }
};

export function get_panels_for_subject(subject){
  return panel_loading_promises(subject)
    .then(
      (panel_keys) => _.chain(panel_keys)
        .map( (panel_keys_for_area, area_id)=> [
          area_id,
          _.chain(panel_keys_for_area)
            .compact() //the above functions create null elements to ease using conditionals, filter them out.
            .map(key => {
              const panel_obj = PanelRegistry.lookup(key, subject.level);

              if(!panel_obj && window.is_dev){
                throw `${key} is not a valid panel`;
              }
    
              return panel_obj && key;
            })
            .value(),
        ])
        .fromPairs()
        .pickBy(_.nonEmpty) //filter out empty bubbles 
        .value()
    );
}