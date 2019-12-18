import text from './services.yaml';

import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  StdPanel,
  Col,
  CommonDonut,
  declare_panel,
  InfographicPanel,
  NivoResponsiveBar,
  declarative_charts,
} from "../shared.js";

const { GraphLegend } = declarative_charts;
import { Fragment } from 'react';

const { text_maker, TM } = create_text_maker_component(text);


const ServicesIdPanel = ({panel_args}) => {
  const data_keys = ["sin_is_identifier", "cra_buisnss_number_is_identifier"];
  const label_keys = ["yes", "no"];
  const colors = infobase_colors();

  const bar_data = _.map(data_keys, key => ({
    yes: _.reduce(panel_args.services, (sum, serv) => serv[key] ? sum+1 : sum, 0),
    no: _.size(panel_args.services) - _.reduce(panel_args.services, (sum, serv) => serv[key] ? sum+1 : sum, 0),
    label: text_maker(`label_${key}`),
  }) );
  

  const legend_items = _.reduce(label_keys, (result, label_value) => {
    result.push({
      id: label_value,
      label: label_value,
      color: colors(label_value),
    });
    return result;
  }, []);

  return (
    <Fragment>
      <TM k={"services_fees_text"} />
      { !window.is_a11y_mode &&
          <Fragment>
            <GraphLegend
              items={legend_items}
            />
            <div className="fcol-md-9" style = {{height: '300px'}} aria-hidden = {true}>
              <NivoResponsiveBar
                data = {bar_data}
                indexBy = "label"
                colorBy = {d => colors(d.id)}
                keys = {label_keys}
                is_money = {false}
                margin = {{
                  top: 15,
                  right: 30,
                  bottom: 40,
                  left: 50,
                }}
              />
            </div>
          </Fragment>
      }
    </Fragment>
  );
};
  

export const declare_services_ids_panel = () => declare_panel({
  panel_key: "dept_services_ids",
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
          <ServicesIdPanel
            panel_args={panel_args}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
