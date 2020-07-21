import text from "./services.yaml";
import { Service } from "../../../models/services.js";
import { service_channels_keys } from "./shared.js";
import { StandardLegend, SelectAllControl } from "../../../charts/legends";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  NivoResponsiveBar,
} from "../shared.js";

const { text_maker } = create_text_maker_component(text);
const colors = infobase_colors();

class ServicesChannelsPanel extends React.Component {
  constructor(props) {
    super(props);

    const services = props.panel_args.services;
    this.state = {
      active_services: _.chain(services)
        .map(({ service_id }) => [service_id, true])
        .take(3)
        .fromPairs()
        .value(),
    };
  }
  render() {
    const { panel_args } = this.props;
    const { active_services } = this.state;
    const services = panel_args.services;

    const bar_data = _.map(service_channels_keys, (key) => ({
      ..._.chain(services)
        .map((service) =>
          active_services[service.service_id] && !_.isNull(service[key])
            ? [
                service.name,
                _.reduce(
                  service.service_report,
                  (sum, report) => sum + report[`${key}_count`],
                  0
                ),
              ]
            : []
        )
        .fromPairs()
        .value(),
      id: text_maker(key),
    }));

    return (
      <div>
        <StandardLegend
          items={_.chain(services)
            .map(({ service_id, name }) => ({
              id: service_id,
              label: name,
              color: colors(name),
              active: active_services[service_id],
            }))
            .sortBy("label")
            .value()}
          onClick={(id) =>
            this.setState({
              active_services: {
                ...active_services,
                [id]: !active_services[id],
              },
            })
          }
          Controls={
            <SelectAllControl
              SelectAllOnClick={() =>
                this.setState({
                  active_services: _.chain(services)
                    .map(({ service_id }) => [service_id, true])
                    .fromPairs()
                    .value(),
                })
              }
              SelectNoneOnClick={() => this.setState({ active_services: {} })}
            />
          }
        />
        <NivoResponsiveBar
          data={bar_data}
          is_money={false}
          keys={_.map(services, "name")}
          indexBy={"id"}
          colorBy={(d) => colors(d.id)}
          bttm_axis={{
            tickRotation: 45,
          }}
          margin={{
            top: 15,
            right: 60,
            bottom: 130,
            left: 60,
          }}
        />
      </div>
    );
  }
}

export const declare_services_channels_panel = () =>
  declare_panel({
    panel_key: "dept_services_channels",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => {
        const services =
          level === "dept"
            ? Service.get_by_dept(subject.id)
            : Service.get_all();
        return { subject, services };
      },
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("services_channels_title")}
            sources={sources}
          >
            <ServicesChannelsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
