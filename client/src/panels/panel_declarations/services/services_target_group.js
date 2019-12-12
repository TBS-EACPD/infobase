import text from './services.yaml';

import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  InfographicPanel,
  get_source_links,

  declare_panel,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);


const ServicesTargetGroupPanel = (services) => {
  return (
    <div>

    </div>
  );
};
  

export const declare_services_target_group_panel = () => declare_panel({
  panel_key: "dept_services_target_group",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
    requires_services: true,
    calculate: (subject) => {  
      const subject_services = level === 'dept' ?
      Service.get_by_dept(subject.id) :
      Service.get_all();
      
      const asdf = Service;
      debugger;
      return {subject_services};},
    footnotes: false,
    render({ calculations, sources}){
      const { subject_services } = calculations;
      return (
        <InfographicPanel
          title={text_maker("services_target_group_title")}
          sources={sources}
        >
          <ServicesTargetGroupPanel
            services={subject_services}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
