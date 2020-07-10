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

const color_scale = d3
  .scaleOrdinal()
  .domain(["met", "not_met"])
  .range(_.take(newIBCategoryColors, 2));

const standard_statuses = ["met", "not_met"];

export class ServiceStandards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_list: standard_statuses,
    };
  }

  render() {
    const { service } = this.props;
    const { active_list } = this.state;
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
          is_target_met: count === met_count,
        }))
      )
      .flatten()
      .value();
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
        formatter: (value) =>
          value ? (
            <IconCheck
              key="met"
              title={text_maker("met")}
              color={color_scale("met")}
              width={38}
              vertical_align={"0em"}
              alternate_color={false}
              inline={false}
            />
          ) : (
            <IconAttention
              key="not_met"
              title={text_maker("not_met")}
              color={color_scale("not_met")}
              width={38}
              vertical_align={"0em"}
              alternate_color={false}
              inline={false}
            />
          ),
        raw_formatter: (value) => String(value),
      },
    };

    const get_status_met = (is_status_met) => {
      return _.reduce(
        data,
        (accumulator, standard) => {
          return standard.is_target_met === is_status_met
            ? accumulator + 1
            : accumulator;
        },
        0
      );
    };

    const large_icons = {
      met: (
        <IconCheck
          key="met"
          title={text_maker("standard_met")}
          color={color_scale("standard_met")}
          width={41}
          vertical_align={"0em"}
          alternate_color={false}
          inline={false}
        />
      ),
      not_met: (
        <IconAttention
          key="not_met"
          title={text_maker("standard_not_met")}
          color={color_scale("standard_not_met")}
          width={41}
          vertical_align={"0em"}
          alternate_color={false}
          inline={false}
        />
      ),
    };

    const filtered_data = _.filter(
      data,
      ({ is_target_met }) =>
        !_.isEmpty(active_list) &&
        (active_list.length === standard_statuses.length ||
          is_target_met === _.includes(active_list, "met"))
    );

    return (
      <Panel title={text_maker("service_standards_title")}>
        <TM className="medium_panel_text" k="service_standards_text" />
        <FilterTable
          items={_.map(standard_statuses, (status_key) => ({
            key: status_key,
            count: get_status_met(status_key === "met"),
            active:
              active_list.length === standard_statuses.length ||
              _.indexOf(active_list, status_key) !== -1,
            text: !window.is_a11y_mode ? (
              <span className="link-unstyled" tabIndex={0} aria-hidden="true">
                {result_simple_statuses[status_key].text}
              </span>
            ) : (
              result_simple_statuses[status_key].text
            ),
            icon: large_icons[status_key],
          }))}
          item_component_order={["count", "icon", "text"]}
          click_callback={(status_key) =>
            this.setState({
              active_list: _.toggle_list(active_list, status_key),
            })
          }
          show_eyes_override={active_list.length === standard_statuses.length}
        />
        <DisplayTable data={filtered_data} column_configs={column_configs} />
      </Panel>
    );
  }
}
