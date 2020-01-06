import text from './services.yaml';

import { Service } from '../../../models/services.js';

import {
  create_text_maker_component,
  declare_panel,
  InfographicPanel,
  NivoResponsiveBar,
  declarative_charts,
  util_components,
} from "../shared.js";

const {
  Select,
} = util_components;

const { GraphLegend } = declarative_charts;
import { Fragment } from 'react';

const { text_maker, TM } = create_text_maker_component(text);




class ServicesChannelsPanel extends React.Component {
  constructor(){
    super();
    this.state = {
      selected_service_id: "all",
    };
  }
  
  render(){
    const {
      panel_args,
    } = this.props;
    const { selected_service_id } = this.state;
    const colors = infobase_colors();

    const data_keys = ["telephone_enquires",	"website_visits",	"online_applications",	"in_person_applications",	"mail_applications",	"other_channel_applications"];

    const all_services = _.chain({})
      .mergeWith(..._.map(panel_args.services, serv=>_.pick(serv,data_keys)),_.add)
      .merge({name: text_maker("all"), id: "all"})
      .value();

    const selected_service = selected_service_id === "all" ? 
      all_services :
      _.find(panel_args.services, serv => serv.id === selected_service_id) || _.first(panel_args.services);
    
    const selected_title = selected_service.name;

    const bar_data = _.map(data_keys, key => ({
      number: selected_service[key],
      label: text_maker(`label_${key}`),
    }) );

    const options = _.chain([all_services])
      .concat(panel_args.services)
      .map(({name, id}) => ({
        id,
        display: name,
      }) )
      .value();
    
    const all_feedback_channels = ["Online", "Postal Mail", "Fax", "Email", "In-Person", "Telephone"];

    const feedback_channel_statuses = _.reduce(all_feedback_channels, (result, channel) => {
      result.push({
        id: channel,
        label: channel,
        color: _.includes(selected_service.feedback_channels, channel) ? colors(0) : null,
      });
      return result;
    }, []);

    return (
      <Fragment>
        <TM k={"communication_channels_text"} />
        { !window.is_a11y_mode &&
            <Fragment>
              <Select
                id = 'select_service'
                selected = {selected_service_id}
                options = {options}
                onSelect = { id => this.setState({selected_service_id: id}) }
                className = "form-control"
                style = {{padding: "5px"}}
              />
              <div>
                {selected_title}
              </div>
              <div className="frow">
                <div className="fcol-md-9" aria-hidden = {true}>
                  <NivoResponsiveBar
                    data = {bar_data}
                    indexBy = "label"
                    colorBy = {d => colors(d.id)}
                    keys = {["number"]}
                    is_money = {false}
                    bttm_axis = {{
                      tickRotation: 45,
                    }}
                    margin = {{
                      top: 15,
                      right: 60,
                      bottom: 130,
                      left: 60,
                    }}
                    graph_height = {"300px"}
                    table_switch = {true}
                    table_data_headers={["TODO name of whatever","TODO number of whatever"]}
                  />
                </div>
                { selected_service_id !== "all" && 
                  <div className="fcol-md-3">
                    <GraphLegend items={feedback_channel_statuses} />
                  </div>
                }
              </div>
            </Fragment>
        }
      </Fragment>
    );
  };
}
  

export const declare_services_channels_panel = () => declare_panel({
  panel_key: "dept_services_channels",
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
          title={text_maker("communication_channels_title")}
          sources={sources}
        >
          <ServicesChannelsPanel
            panel_args={panel_args}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
