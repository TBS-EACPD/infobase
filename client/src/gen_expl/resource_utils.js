import { planned_resource_fragment } from '../panels/panel_declarations/results/results_common.js';


export function get_resources_for_subject(subject, doc){
  const resources = planned_resource_fragment(subject, doc);

  if(resources.spending || resources.ftes){
    return resources;
  } else {
    return null;
  }
}