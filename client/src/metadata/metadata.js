import _ from "lodash";
import React from "react";

import {
  create_text_maker_component,
  FancyUL,
  Panel,
} from "src/components/index";

import { DataSets } from "src/models/metadata/DataSets";
import { DataSources } from "src/models/metadata/DataSources";

import {
  StandardRouteContainer,
  ScrollToTargetContainer,
} from "src/core/NavComponents";

import metadata_text from "./metadata.yaml";

const { text_maker, TM } = create_text_maker_component(metadata_text);

export default class MetaData extends React.Component {
  render() {
    const {
      match: {
        params: { data_source },
      },
    } = this.props;

    return (
      <StandardRouteContainer
        title={text_maker("metadata")}
        breadcrumbs={[text_maker("metadata")]}
        description={text_maker("metadata_desc_meta_attr")}
        route_key="_metadata"
      >
        <div>
          <h1>
            <TM k="metadata" />
          </h1>
        </div>
        <p>
          <TM k="metadata_t" />
        </p>
        <ScrollToTargetContainer target_id={data_source}>
          {_.map(DataSources, (source) => {
            const data_sets = _.pickBy(DataSets, ({ source_keys }) =>
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
