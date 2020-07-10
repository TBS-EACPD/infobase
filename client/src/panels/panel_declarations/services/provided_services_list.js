import text from "./services.yaml";
import { Service } from "../../../models/services.js";
import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
} from "../shared.js";

import { FancyUL } from "../../../components";

const { text_maker, TM } = create_text_maker_component(text);

class ProvidedServicesListPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { service_query: "" };
  }

  render() {
    const { panel_args } = this.props;
    const { service_query } = this.state;

    return (
      <div>
        <TM
          k="list_of_provided_services_desc"
          args={{
            subject_name: panel_args.subject.name,
            num_of_services: panel_args.services.length,
          }}
        />
        <input
          aria-label={text_maker("explorer_search_is_optional")}
          className="form-control input-lg"
          type="text"
          style={{ width: "100%", marginBottom: "1rem", marginTop: "2rem" }}
          placeholder={text_maker("filter_results_service")}
          onChange={(evt) => this.setState({ service_query: evt.target.value })}
          value={service_query}
        />
        <FancyUL>
          {_.map(
            _.filter(
              panel_args.services,
              (service) =>
                _.includes(
                  service.name.toLowerCase(),
                  service_query.toLowerCase()
                ) ||
                _.find(service.service_type, (type) =>
                  _.includes(type.toLowerCase(), service_query.toLowerCase())
                )
            ),
            ({ name, id, org_id, service_type, description }) => (
              <React.Fragment key={id}>
                <a href={`#dept/${org_id}/service-panels/${id}`}>{name}</a>
                <p>{description}</p>
                <div
                  style={{
                    display: "flex",
                    fontSize: "14px",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    {_.map(service_type, (type) => (
                      <div
                        className="tag-badge"
                        style={{ marginRight: "1rem" }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                  <a href={`#dept/${org_id}/service-panels/${id}`}>
                    <button className="btn-ib-primary">
                      <TM k="view_service" />
                    </button>
                  </a>
                </div>
              </React.Fragment>
            )
          )}
        </FancyUL>
      </div>
    );
  }
}

export const declare_provided_services_list_panel = () =>
  declare_panel({
    panel_key: "dept_provided_services_list",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => ({
        subject,
        services: Service.get_by_dept(subject.id),
      }),
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("list_of_provided_services_title")}
            sources={sources}
          >
            <ProvidedServicesListPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
