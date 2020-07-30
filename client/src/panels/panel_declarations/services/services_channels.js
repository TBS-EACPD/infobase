import text from "./services.yaml";
import { Service } from "../../../models/services.js";
import { service_channels_keys } from "./shared.js";
import { StandardLegend, SelectAllControl } from "../../../charts/legends";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoBar,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);
const colors = infobase_colors();

class ServicesChannelsPanel extends React.Component {
  constructor(props) {
    super(props);

    const services = props.panel_args.services;
    // Get 3 median of each report's maximum channel volume
    const median_3_values = _.chain(services)
      .map((service) => ({
        id: service.id,
        value: _.chain(service_channels_keys)
          .map((key) =>
            _.map(service.service_report, (report) => report[`${key}_count`])
          )
          .flatten()
          .max()
          .value(),
      }))
      .filter("value")
      .sortBy("value")
      .map("id")
      .thru((processed_services) =>
        _.times(3, (i) =>
          _.nth(processed_services, _.floor(processed_services.length / 2) - i)
        )
      )
      .map((id) => [id, true])
      .fromPairs()
      .value();

    this.state = {
      active_services: median_3_values,
    };
  }
  render() {
    const { panel_args } = this.props;
    const { active_services } = this.state;
    const services = panel_args.services;

    const { max_vol_service_name, max_vol_service_value } = _.chain(services)
      .map(({ name, service_report }) => ({
        max_vol_service_name: name,
        max_vol_service_value: _.chain(service_channels_keys)
          .map((key) => _.sumBy(service_report, `${key}_count`))
          .sum()
          .value(),
      }))
      .maxBy("max_vol_service_value")
      .value();
    const { max_vol_channel_name, max_vol_channel_value } = _.chain(
      service_channels_keys
    )
      .map((key) => ({
        max_vol_channel_name: text_maker(key),
        max_vol_channel_value: _.chain(services)
          .map(({ service_report }) => _.sumBy(service_report, `${key}_count`))
          .sum()
          .value(),
      }))
      .maxBy("max_vol_channel_value")
      .value();

    const bar_data = _.map(service_channels_keys, (key) => ({
      id: text_maker(key),
      ..._.chain(services)
        .filter(({ id }) => active_services[id])
        .map((service) => [
          service.name,
          _.sumBy(service.service_report, `${key}_count`) || 0,
        ])
        .fromPairs()
        .value(),
    }));

    return (
      <div>
        <TM
          className="medium_panel_text"
          k="services_channels_text"
          args={{
            max_vol_service_name,
            max_vol_service_value,
            max_vol_channel_name,
            max_vol_channel_value,
          }}
        />
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
        <WrappedNivoBar
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
        const services = Service.get_by_dept(subject.id);
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
