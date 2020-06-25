import text from "./ServicePanels.yaml";
import { StandardRouteContainer } from "../../core/NavComponents.js";
import {
  create_text_maker_component,
  Panel,
  SpinnerWrapper,
} from "../../components";
import { ensure_loaded } from "../../core/lazy_loader.js";
import { Service } from "../../models/services";
import { Subject } from "../../models/subject";
import { infograph_href_template } from "../../link_utils.js";
import { ServiceOverview } from "../panel_declarations/services";

const { text_maker, TM } = create_text_maker_component(text);

const ServiceChannelPanel = (panel_args) => {
  const service = panel_args.service;
  return (
    <Panel title={text_maker("service_channels_title")}>This is channels</Panel>
  );
};
const ServiceStandardsPanel = (panel_args) => {
  const service = panel_args.service;
  return (
    <Panel title={text_maker("service_standards_title")}>
      This is standards
    </Panel>
  );
};

export default class ServicePanels extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, service: null };
  }
  componentDidMount() {
    const {
      match: {
        params: { subject_id },
      },
    } = this.props;
    const subject = Subject.Dept.lookup(subject_id);

    ensure_loaded({
      subject: subject,
      has_services: true,
      services: true,
    }).then(() => {
      this.setState({ loading: false });
    });
  }
  render() {
    const {
      match: {
        params: { service_id, subject_id },
      },
    } = this.props;

    const { loading } = this.state;
    const subject = Subject.Dept.lookup(subject_id);
    const service = Service.lookup(service_id);

    return (
      <StandardRouteContainer
        title={text_maker("service_page_title")}
        breadcrumbs={[
          <a href={infograph_href_template(subject, "services")}>
            {subject.name}
          </a>,
          text_maker("service_page_title"),
        ]}
        description={text_maker("service_page_desc")}
        route_key="service_panels"
      >
        {loading ? (
          <SpinnerWrapper ref="spinner" config_name={"sub_route"} />
        ) : (
          <div>
            <h1>{service.name}</h1>
            <ServiceOverview service={service} />
            <ServiceChannelPanel service={service} />
            <ServiceStandardsPanel service={service} />
          </div>
        )}
      </StandardRouteContainer>
    );
  }
}
