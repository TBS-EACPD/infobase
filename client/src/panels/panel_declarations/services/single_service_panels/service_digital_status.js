import text from "../services.yaml";
import {
  create_text_maker_component,
  Panel,
  DisplayTable,
} from "../../../../components";
import {
  digital_status_keys,
  available_icons,
  available_keys,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceDigitalStatus extends React.Component {
  render() {
    const { service } = this.props;

    const column_configs = {
      overview_digital_status_desc: {
        index: 0,
        header: text_maker("overview_digital_status_desc"),
        formatter: (key) => (
          <div>
            <TM k={key} el="h4" />
            <TM k={`${key}_desc`} />
          </div>
        ),
        raw_formatter: (key) =>
          `${text_maker(key)} ${text_maker(`${key}_desc`)}}`,
      },
      digital_status: {
        index: 1,
        header: text_maker("online_status"),
        formatter: (value) => (
          <div>
            {available_icons[available_keys[value]]}
            <TM style={{ marginLeft: 5 }} k={available_keys[value]} />
          </div>
        ),
        raw_formatter: (value) => available_keys[value],
      },
    };

    return (
      <Panel title={text_maker("digital_status")}>
        <TM className="medium_panel_text" k="overview_digital_status_title" />
        <DisplayTable
          data={_.map(digital_status_keys, (key) => ({
            overview_digital_status_desc: key,
            digital_status: service[`${key}_status`],
          }))}
          column_configs={column_configs}
          util_components={{
            copyCsvUtil: null,
            downloadCsvUtil: null,
            columnToggleUtil: null,
          }}
        />
      </Panel>
    );
  }
}
