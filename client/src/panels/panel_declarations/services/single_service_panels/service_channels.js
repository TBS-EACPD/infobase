import text from "../services.yaml";
import { service_channels_keys } from "../shared.js";
import { create_text_maker_component, Panel } from "../../../../components";
import { NivoResponsivePie } from "../../../../charts/wrapped_nivo";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceChannels extends React.Component {
  render() {
    const { service } = this.props;
    return (
      <Panel title={text_maker("service_channels_title")}>
        <div style={{ display: "flex" }}>
          <div className="fcol-md-5">
            <TM k="service_channels_text" className="medium_panel_text" />
          </div>
          <div className="fcol-md-7">
            <NivoResponsivePie
              data={_.chain(service_channels_keys)
                .map((key) => ({
                  id: key,
                  label: text_maker(key),
                  value: _.reduce(
                    service.service_report,
                    (sum, report) => sum + report[`${key}_count`],
                    0
                  ),
                }))
                .filter((row) => row.value)
                .value()}
              is_money={false}
            />
          </div>
        </div>
      </Panel>
    );
  }
}
