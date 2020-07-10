import text from "../services.yaml";
import {
  create_text_maker_component,
  Panel,
  DisplayTable,
  FilterTable,
} from "../../../../components";
import { newIBCategoryColors, businessConstants } from "../../shared.js";
import { IconAttention, IconCheck } from "../../../../icons/icons.js";

const { text_maker, TM } = create_text_maker_component(text);

const standard_statuses = ["met", "not_met"];
const color_scale = d3
  .scaleOrdinal()
  .domain(standard_statuses)
  .range(_.take(newIBCategoryColors, 2));

export class ServiceStandards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_statuses: standard_statuses,
    };
  }

  render() {
    const { service } = this.props;
    const { active_statuses } = this.state;
    const { result_simple_statuses } = businessConstants;
    const standards = service.standards;
    const data = _.chain(standards)
      .map(({ name, type, channel, standard_report }) =>
        _.map(standard_report, ({ year, count, met_count }) => ({
          name: name,
          year: year,
          standard_type: type,
          channel: channel,
          count: count,
          met_count: met_count,
          //TODO need is_target_met field from Titan
          is_target_met: count === met_count ? "met" : "not_met",
        }))
      )
      .flatten()
      .value();
    const get_icon_props = (status) => ({
      key: status,
      title: result_simple_statuses[status].text,
      color: color_scale(status),
      width: 38,
      vertical_align: "0em",
      alternate_color: false,
      inline: false,
    });
    const status_icons = {
      met: <IconCheck {...get_icon_props("met")} />,
      not_met: <IconAttention {...get_icon_props("not_met")} />,
    };

    const column_configs = {
      name: {
        index: 0,
        header: text_maker("standard_name"),
        is_searchable: true,
      },
      year: {
        index: 1,
        header: text_maker("year"),
      },
      standard_type: {
        index: 2,
        header: text_maker("standard_type"),
      },
      channel: {
        index: 3,
        header: text_maker("standard_channel"),
      },
      count: {
        index: 4,
        header: text_maker("target"),
      },
      met_count: {
        index: 5,
        header: text_maker("actual_result"),
      },
      is_target_met: {
        index: 6,
        header: text_maker("status"),
        formatter: (value) => status_icons[value],
        //raw_formatter: (value) => String(value),
      },
    };

    const filtered_data = _.filter(
      data,
      ({ is_target_met }) =>
        !_.isEmpty(active_statuses) &&
        (active_statuses.length === standard_statuses.length ||
          _.includes(active_statuses, is_target_met))
    );

    return (
      <Panel title={text_maker("service_standards_title")}>
        <TM className="medium_panel_text" k="service_standards_text" />
        <FilterTable
          items={_.map(standard_statuses, (status_key) => ({
            key: status_key,
            count: _.countBy(data, "is_target_met")[status_key] || 0,
            active:
              active_statuses.length === standard_statuses.length ||
              _.indexOf(active_statuses, status_key) !== -1,
            text: !window.is_a11y_mode ? (
              <span className="link-unstyled" tabIndex={0} aria-hidden="true">
                {result_simple_statuses[status_key].text}
              </span>
            ) : (
              result_simple_statuses[status_key].text
            ),
            icon: status_icons[status_key],
          }))}
          item_component_order={["count", "icon", "text"]}
          click_callback={(status_key) =>
            this.setState({
              active_statuses: _.toggle_list(active_statuses, status_key),
            })
          }
          show_eyes_override={
            active_statuses.length === standard_statuses.length
          }
        />
        <DisplayTable data={filtered_data} column_configs={column_configs} />
      </Panel>
    );
  }
}
