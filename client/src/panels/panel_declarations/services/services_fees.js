import text from './services.yaml';

import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  StdPanel,
  Col,
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

  const total_uses_CRA = _.reduce(panel_args.services, (sum, serv) => serv.cra_buisnss_number_is_identifier ? sum+1 : sum, 0);
  const total_no_CRA = _.size(panel_args.services) - total_uses_CRA;
  const data_CRA = [
    {
      value: total_uses_CRA,
      label: text_maker("uses_CRA"),
      id: "uses_CRA",
    },
    {
      value: total_no_CRA,
      label: text_maker("no_CRA"),
      id: "no_CRA",
    },
  ];

  const total_uses_SIN = _.reduce(panel_args.services, (sum, serv) => serv.sin_is_identifier ? sum+1 : sum, 0);
  const total_no_SIN = _.size(panel_args.services) - total_uses_SIN;
  const data_SIN = [
    {
      value: total_uses_SIN,
      label: text_maker("uses_SIN"),
      id: "uses_SIN",
    },
    {
      value: total_no_SIN,
      label: text_maker("no_SIN"),
      id: "no_SIN",
    },
  ];

  return (
    <Fragment>
      <TM k={"services_fees_text"} />
      { !window.is_a11y_mode &&
          <Fragment>
            <CommonDonut
              graph_data = {data_fees}
              legend_data = {data_fees}
              graph_height = '300px'
            />
            <CommonDonut
              graph_data = {data_CRA}
              legend_data = {data_CRA}
              graph_height = '300px'
            />
            <CommonDonut
              graph_data = {data_SIN}
              legend_data = {data_SIN}
              graph_height = '300px'
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
