import text from './services.yaml';
import './services.scss';
import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  declare_panel,
  InfographicPanel,
  NivoResponsiveHeatMap,
  declarative_charts,
} from "../shared.js";

import classNames from 'classnames';

const { GraphLegend } = declarative_charts;

const { text_maker} = create_text_maker_component(text);

const ServicesDigitalPanel = ({panel_args}) => {
  const colors = infobase_colors();

  const data_keys = ["account_reg_digital_status", "authentication_status", "application_digital_status", "decision_digital_status", "issuance_digital_status", "issue_res_digital_status"];

  const heatmap_data = _.chain(panel_args.services)
    .map(serv=>_.pick(serv,_.concat(["name"],data_keys)))
    .value();

  const value_colors = {
    true: "services-icon-array-true",
    false: "services-icon-array-false",
    null: "services-icon-array-na",
  };

  // const legend_items = _.reduce(label_keys, (result, label_value) => {
  //   result.push({
  //     id: label_value,
  //     label: label_value,
  //     color: colors(label_value),
  //   });
  //   return result;
  // }, []);
  //
  //   {/* <GraphLegend
  //    items={legend_items}
  //   /> */}


  const total = _.size(panel_args.services);
  const icon_array_size_class = classNames("IconArrayItem", total > 200 && "IconArrayItem__Small", total < 100 && "IconArrayItem__Large");

  return (
    <div>
      { !window.is_a11y_mode &&
        <div className="fcol-md-9" style = {{height: '400px'}}>
          <NivoResponsiveHeatMap
            data={heatmap_data}
            keys={data_keys}
            indexBy="name"
            tooltip={null}
            colors={colors}
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
