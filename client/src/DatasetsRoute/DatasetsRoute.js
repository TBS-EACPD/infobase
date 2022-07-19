import _ from "lodash";
import React from "react";

import {
  create_text_maker_component,
  FancyUL,
  Panel,
} from "src/components/index";

import { Datasets } from "src/models/metadata/Datasets";
import { Sources } from "src/models/metadata/Sources";

import { services_feature_flag } from "src/core/injected_build_constants";
import {
  StandardRouteContainer,
  ScrollToTargetContainer,
} from "src/core/NavComponents";

import text from "./DatasetsRoute.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const source_legacy_key_map = {
  IGOC: "igoc",
  PA: "public_accounts",
  CFMRS: "central_financial_management_system",
  ESTIMATES: "estimates",
  DP: "departmental_plans",
  DRR: "departmental_results_reports",
  RPS: "employee_pay_system",
  COVID: "covid",
  ...(services_feature_flag && {
    SERVICES: "service_inventory",
  }),
};

export default class DatasetsRoute extends React.Component {
  render() {
    const {
      match: {
        params: { source_key },
      },
    } = this.props;

    return (
      <StandardRouteContainer
        title={text_maker("datasets")}
        breadcrumbs={[text_maker("datasets")]}
        description={text_maker("datasets_route_description")}
        route_key="_metadata"
      >
        <div>
          <h1>
            <TM k="datasets" />
          </h1>
        </div>
        <p>
          <TM k="datasets_route_description" />
        </p>
        <ScrollToTargetContainer
          target_id={
            source_key in source_legacy_key_map
              ? source_legacy_key_map[source_key]
              : source_key
          }
        >
          {_.map(Sources, (source) => {
            const data_sets = _.pickBy(Datasets, ({ source_keys }) =>
              _.includes(source_keys, source.key)
            );

            return (
              <div key={source.key} id={source.key}>
                <Panel title={source.name}>
                  <div>{source.description}</div>
                  {data_sets && (
                    <FancyUL title={text_maker("datasets")}>
                      {_.map(
                        data_sets,
                        ({ key, name, infobase_link, open_data_link }) => (
                          <span key={key} className="row">
                            <div className="col-12 d-flex">
                              {infobase_link ? (
                                <a
                                  title={text_maker("rpb_link_text")}
                                  href={infobase_link}
                                  style={{ alignSelf: "center" }}
                                >
                                  {name}
                                </a>
                              ) : (
                                <span style={{ alignSelf: "center" }}>
                                  {name}
                                </span>
                              )}
                              {open_data_link && (
                                <a
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-xs btn-ib-primary btn-responsive-fixed-width"
                                  href={open_data_link}
                                >
                                  <TM k="open_data_link" />
                                </a>
                              )}
                            </div>
                          </span>
                        )
                      )}
                    </FancyUL>
                  )}
                  <div className="row">
                    <div className="col-12 d-flex">
                      <span style={{ alignSelf: "center" }}>
                        <TM k="refresh_freq" /> {source.frequency}
                      </span>
                      <div
                        style={{ marginLeft: "auto" }} //fix a flexbox bug
                      >
                        {source.authoritative_link && (
                          <a
                            className="btn btn-ib-primary"
                            style={{ margin: "5px" }}
                            target="_blank"
                            rel="noopener noreferrer"
                            href={source.authoritative_link}
                          >
                            <TM k="original_report_link" />
                          </a>
                        )}
                        {source.open_data_link && (
                          <a
                            className="btn btn-ib-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={source.open_data_link}
                          >
                            <TM k="open_data_link" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>
            );
          })}
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}
