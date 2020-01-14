import text from './services.yaml';

import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  InfographicPanel,

  declare_panel,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);


const ServicesIntroPanel = ({panel_args}) => {

  const num_services = _.size(panel_args.services);

  return (
    <div className="medium_panel_text">
      <TM k="services_intro_text" args={{num_services, subject: panel_args.subject}}/>
    </div>
  );
};
  

export const declare_services_intro_panel = () => declare_panel({
  panel_key: "dept_services_intro",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
    requires_services: true,
    calculate: (subject) => {  
      const services = level === 'dept' ?
      Service.get_by_dept(subject.id) :
      Service.get_all();
      return {subject, services};},
    footnotes: false,
    render({ calculations, sources}){
      const { panel_args } = calculations;
      return (
        <InfographicPanel
          title={text_maker("services_intro_title")}
          sources={sources}
        >
          <ServicesIntroPanel
            panel_args={panel_args}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
