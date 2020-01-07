import text from './services.yaml';
import './services.scss';
import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  declare_panel,
  InfographicPanel,
  NivoResponsiveHeatMap,
  declarative_charts,
  formats,
} from "../shared.js";

import {Fragment} from 'react';

const { GraphLegend } = declarative_charts;

const { text_maker, TM } = create_text_maker_component(text);

const ServicesDigitalPanel = ({panel_args}) => {

  const data_keys = ["account_reg_digital_status", "authentication_status", "application_digital_status", "decision_digital_status", "issuance_digital_status", "issue_res_digital_status"];

  const heatmap_data = _.chain(panel_args.services)
    .map(serv=>_.pick(serv,_.concat(["name"], data_keys)))
    .map(serv=>_.each(serv, (value, key)=>{
      if(value===null) serv[key] = NaN;
      if(_.includes(data_keys, key)) serv[text_maker(key)] = serv[key];
    } ))
    .value();

  const legend_items = [
    {
      id: "legend_true",
      label: text_maker("digital_option_available"),
      color: window.infobase_color_constants.secondaryColor,
    },
    {
      id: "legend_false",
      label: text_maker("digital_option_not_available"),
      color: "#4abbc4",
    },
    {
      id: "legend_NaN",
      label: text_maker("services_unknown"),
      color: window.infobase_color_constants.tertiaryColor,
    },
  ];

  const value_display = (val) => {
    const obj = _.find(legend_items, item => item.id === `legend_${val}`);
    return obj.label;
  };

  const tooltip = (tooltip_items, formatter) => (
    <div style={{color: window.infobase_color_constants.textColor}}>
      <table style={{width: '100%'}}>
        <tbody>
          { tooltip_items.map(
            tooltip_item => (
              <Fragment key = {tooltip_item.key}>
                <tr>
                  <td style= {{padding: '3px 5px'}}>
                    <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.color, marginLeft: "auto", marginRight: 0}} />
                  </td>
                  <td style={{padding: '3px 5px'}}>{tooltip_item.yKey}</td>
                </tr>
                <tr>
                  <td/>
                  <td style={{padding: '3px 5px'}}>{tooltip_item.xKey}: {value_display(tooltip_item.value)}</td>
                </tr>
              </Fragment>
            )
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="medium_panel_text">
        <TM k={"services_digital_status_text"} />
      </div>
      { !window.is_a11y_mode &&
        <div>
          <div className="fcol-md-9">
            <NivoResponsiveHeatMap
              data={heatmap_data}
              keys={_.map(data_keys, key => text_maker(key))}
              indexBy="name"
              tooltip={(d) => tooltip( [d], (value) => formats.big_int(value, {raw: true}) ) }
              colors={["#4abbc4",window.infobase_color_constants.secondaryColor]}
              nanColor={window.infobase_color_constants.tertiaryColor}
              enableLabels={false}
              padding={1}
              motion_stiffness={100}
              top_axis={{
                tickSize: 7,
                tickPadding: 10,
                tickRotation: -45,
              }}
              margin={{
                top: 150,
                right: 30,
                bottom: 30,
                left: 70,
              }}
              graph_height = {"400px"}
              table_switch = {true}
              label_col_header = {text_maker("service_name")}
            />
          </div>
          <GraphLegend
            items={legend_items}
          />
        </div>
      }
    </div>
  );
};

export const declare_services_digital_status_panel = () => declare_panel({
  panel_key: "dept_services_digital",
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
          title={text_maker("digital_status_title")}
          sources={sources}
        >
          <ServicesDigitalPanel
            panel_args={panel_args}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
