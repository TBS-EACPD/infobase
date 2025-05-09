import _ from "lodash";
import React, { useState } from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, FancyUL } from "src/components/index";
import { SuspenseLeafSpinner } from "src/components/LeafSpinner/LeafSpinner";

import {
  suspendedServicesForOrg,
  suspendedServicesForProgram,
} from "src/models/services/queries";

import { infographic_href_template } from "src/infographic/infographic_href_template";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const service_infographic_link = (id) =>
  infographic_href_template({ id, subject_type: "service" });

const ProvidedServicesListPanel = ({ subject }) => {
  const [service_query, set_service_query] = useState("");
  const getServicesQuery =
    subject.subject_type === "program"
      ? suspendedServicesForProgram
      : suspendedServicesForOrg;
  const services = getServicesQuery({ id: subject.id });

  const includes_lowercase = (value, query) =>
    _.includes(value.toLowerCase(), query.toLowerCase());
  const filtered_sorted_data = _.chain(services)
    .filter(
      ({ name, service_type }) =>
        includes_lowercase(name, service_query) ||
        _.find(service_type, (type) => includes_lowercase(type, service_query))
    )
    .sortBy("name")
    .sortBy(({ is_active }) => (is_active ? -Infinity : Infinity))
    .value();

  return (
    <React.Fragment>
      <div className="medium-panel-text">
        {subject.subject_type === "program" && (
          <TM k="list_of_provided_services_program_caveat" />
        )}
        <TM
          k={"list_of_provided_services_desc"}
          args={{
            subject_name: subject.name,
            active_count: _.filter(services, "is_active").length || 0,
          }}
        />
      </div>
      <input
        aria-label={text_maker("explorer_search_is_optional")}
        className="form-control input-lg"
        type="text"
        style={{ width: "100%", marginBottom: "1rem", marginTop: "2rem" }}
        placeholder={text_maker("filter_results_service")}
        onChange={(evt) => set_service_query(evt.target.value)}
        value={service_query}
      />
      <HeightClippedGraph clipHeight={400}>
        <FancyUL>
          {_.map(
            filtered_sorted_data,
            ({ name, id, description, service_type, is_active }) => (
              <React.Fragment key={id}>
                <a href={service_infographic_link(id)}>{name}</a>
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
                      <span
                        key={type}
                        className="tag-badge"
                        style={{ marginRight: "1rem" }}
                      >
                        {type}
                      </span>
                    ))}
                    {!is_active && (
                      <span
                        className="tag-badge tag-badge--red"
                        style={{ marginRight: "1rem" }}
                      >
                        {text_maker("inactive_service")}
                      </span>
                    )}
                  </div>
                  <a href={service_infographic_link(id)}>
                    <button className="btn-ib-primary">
                      <TM k="view_service" />
                    </button>
                  </a>
                </div>
              </React.Fragment>
            )
          )}
        </FancyUL>
      </HeightClippedGraph>
    </React.Fragment>
  );
};

export const declare_provided_services_list_panel = () =>
  declare_panel({
    panel_key: "provided_services_list",
    subject_types: ["dept", "program"],
    panel_config_func: () => ({
      get_title: () => text_maker("list_of_provided_services_title"),
      get_dataset_keys: () => ["service_inventory"],
      render({ title, subject, sources }) {
        return (
          <InfographicPanel title={title} sources={sources}>
            <SuspenseLeafSpinner config_name={"subroute"}>
              <ProvidedServicesListPanel subject={subject} />
            </SuspenseLeafSpinner>
          </InfographicPanel>
        );
      },
    }),
  });
