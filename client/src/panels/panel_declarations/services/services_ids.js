import text from './services.yaml';

import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  declare_panel,
  InfographicPanel,
  NivoResponsiveBar,
} from "../shared.js";

import { Fragment } from 'react';

const { text_maker, TM } = create_text_maker_component(text);


const ServicesIdPanel = ({panel_args}) => {
  const data_keys = ["sin_is_identifier", "cra_buisnss_number_is_identifier"];
  const label_keys = ["uses_this_id", "doesnt_use_id"];
  const labels = _.map(label_keys, key => text_maker(`label_${key}`));
  const colors = infobase_colors();

  const bar_data = _.chain(data_keys)
    .map(key => ({
      uses_this_id: _.reduce(panel_args.services, (sum, serv) => serv[key] ? sum+1 : sum, 0),
      doesnt_use_id: _.size(panel_args.services) - _.reduce(panel_args.services, (sum, serv) => serv[key] ? sum+1 : sum, 0),
      label: text_maker(`label_${key}`),
    }) )
    .each(obj => _.each(obj, (value, key)=>{
      if(_.includes(label_keys, key)) obj[text_maker(`label_${key}`)] = obj[key];
    } ))
    .value();

  return (
    <Fragment>
      <TM k={"services_ids_text"} />
      { !window.is_a11y_mode &&
          <div className="fcol-md-9" aria-hidden = {true}>
            <NivoResponsiveBar
              data = {bar_data}
              indexBy = "label"
              colorBy = {d => colors(d.id)}
              keys = {labels}
              is_money = {false}
              margin = {{
                top: 50,
                right: 30,
                bottom: 40,
                left: 50,
              }}
              legends = {[
                {
                  dataFrom: 'keys',
                  anchor: 'top-left',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: -30,
                  itemDirection: 'left-to-right',
                  itemWidth: 2,
                  itemHeight: 20,
                  itemsSpacing: 160,
                  itemOpacity: 0.75,
                  symbolSize: 20,
                },
              ]}
              graph_height = {"300px"}
              table_switch = {true}
              label_col_header = {text_maker("label_identifier")}
            />
          </div>
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
          title={text_maker("services_ids_title")}
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
