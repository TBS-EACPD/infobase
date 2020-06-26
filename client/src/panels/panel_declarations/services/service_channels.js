import text from "./service_channels.yaml";
import { create_text_maker_component, Panel } from "../../../components";
import { NivoResponsivePie } from "../../../charts/wrapped_nivo";

const { text_maker, TM } = create_text_maker_component(text);

const service_channels_keys = [
  "in_person_applications",
  "mail_applications",
  "online_applications",
  "other_channel_applications",
  "telephone_enquires",
  "website_visits",
];

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
                  value: service[key],
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
