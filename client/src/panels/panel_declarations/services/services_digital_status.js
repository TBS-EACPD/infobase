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

import classNames from 'classnames';

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
      id: "legend_yes",
      label: text_maker("digital_option_available"),
      color: window.infobase_color_constants.secondaryColor,
    },
    {
      id: "legend_no",
      label: text_maker("digital_option_not_available"),
      color: "#4abbc4",
    },
    {
      id: "legend_na",
      label: text_maker("services_unknown"),
      color: window.infobase_color_constants.tertiaryColor,
    },
  ];
  

  function colors(d) {
    const d_str = _.toString(d);


    return _.isNull(d) ?
      "grey" :
      d3.scaleLinear()
        .domain([true, false])
        .range(["green","red"]);
  }
  colors.domain = () => [true, false];
  colors.range = () => ["green","red"];

  const value_display = (val) => (
    _.isNaN(val) ?
      text_maker("not_available") :
      val ? text_maker("yes") : text_maker("no")
  );

  const tooltip = (tooltip_items, formatter) => (
    <div style={{color: window.infobase_color_constants.textColor}}>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <tbody>
          { tooltip_items.map(
            tooltip_item => (
              <tr key = {tooltip_item.key}>
                <td style= {{padding: '3px 5px'}}>
                  <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.color}} />
                </td>
                <td style={{padding: '3px 5px'}}> {tooltip_item.yKey} </td>
                <td style={{padding: '3px 5px'}}> : </td>
                <td style={{padding: '3px 5px'}}> {tooltip_item.xKey} </td> 
                <td style={{padding: '3px 5px'}}> : </td>
                <td style={{padding: '3px 5px'}}> {value_display(tooltip_item.value)} </td> 
              </tr>
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
          <div className="fcol-md-9" style = {{height: '400px'}}>
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
