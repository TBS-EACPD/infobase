import text from './services.yaml';

import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  CommonDonut,
  declare_panel,
  InfographicPanel,
} from "../shared.js";

import { Fragment } from 'react';

const { text_maker, TM } = create_text_maker_component(text);


const ServicesFeesPanel = ({panel_args}) => {
  const total_with_fees = _.reduce(panel_args.services, (sum, serv) => serv.collects_fees ? sum+1 : sum, 0);
  const total_without_fees = _.size(panel_args.services) - total_with_fees;
  const data_fees = [
    {
      value: total_with_fees,
      label: text_maker("has_fees"),
      id: "has_fees",
    },
    {
      value: total_without_fees,
      label: text_maker("no_fees"),
      id: "no_fees",
    },
  ];

  return (
    <Fragment>
      <div className="medium_panel_text">
        <TM k={"services_fees_text"} />
      </div>
      { !window.is_a11y_mode &&
          <Fragment>
            <CommonDonut
              graph_data = {data_fees}
              legend_data = {data_fees}
              graph_height = '300px'
              data_format = 'int'
            />
          </Fragment>
      }
    </Fragment>
  );
};
  

export const declare_services_fees_panel = () => declare_panel({
  panel_key: "dept_services_fees",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
    requires_services: true,
    calculate: (subject) => {  
      const services = level === 'dept' ?
      Service.get_by_dept(subject.id) :
      Service.get_all();
      return {services};},
    footnotes: false,
    render({ calculations, sources}){
      const { panel_args } = calculations;
      
      return (
        <InfographicPanel
          title={text_maker("services_fees_title")}
          sources={sources}
        >
          <ServicesFeesPanel
            panel_args={panel_args}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
