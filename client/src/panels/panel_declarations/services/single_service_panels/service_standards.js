import text from "../services.yaml";
import {
  create_text_maker_component,
  Panel,
  DisplayTable,
} from "../../../../components";
import { newIBCategoryColors } from "../../shared.js";
import { IconAttention, IconCheck } from "../../../../icons/icons.js";

const { text_maker, TM } = create_text_maker_component(text);

const color_scale = d3
  .scaleOrdinal()
  .domain(["met", "not_met"])
  .range(_.take(newIBCategoryColors, 2));

export class ServiceStandards extends React.Component {
  render() {
    const { service } = this.props;
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
    return (
      <Panel title={text_maker("service_standards_title")}>
        <TM className="medium_panel_text" k="service_standards_text" />
        <DisplayTable data={data} column_configs={column_configs} />
      </Panel>
    );
  }
}
