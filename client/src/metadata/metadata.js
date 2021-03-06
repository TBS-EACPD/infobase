import _ from "lodash";
import React from "react";

import {
  create_text_maker_component,
  FancyUL,
  Panel,
} from "src/components/index";

import { lang } from "src/core/injected_build_constants";

import {
  StandardRouteContainer,
  ScrollToTargetContainer,
} from "src/core/NavComponents";

import { sources } from "./data_sources";

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
          {_.map(sources, (source) => (
            <div key={source.key} id={source.key}>
              <Panel title={source.title}>
                <div>{source.description}</div>
                <FancyUL title={text_maker("datasets")}>
                  {_.map(
                    source.items,
                    ({ key, id, text, inline_link, external_link }) => (
                      <span key={key || id} className="row">
                        <div className="col-12 d-flex">
                          {inline_link ? (
                            <a
                              title={text_maker("rpb_link_text")}
                              href={inline_link}
                              style={{ alignSelf: "center" }}
                            >
                              {text}
                            </a>
                          ) : (
                            <span style={{ alignSelf: "center" }}>{text}</span>
                          )}
                          {external_link && (
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-ib-primary btn-responsive-fixed-width"
                              href={external_link}
                            >
                              <TM k="open_data_link" />
                            </a>
                          )}
                        </div>
                      </span>
                    )
                  )}
                </FancyUL>
                <div className="row">
                  <div className="col-12 d-flex">
                    <span style={{ alignSelf: "center" }}>
                      <TM k="refresh_freq" /> {source.frequency}
                    </span>
                    <div
                      style={{ marginLeft: "auto" }} //fix a flexbox bug
                    >
                      {source.original_link && (
                        <a
                          className="btn btn-ib-primary"
                          style={{ margin: "5px" }}
                          target="_blank"
                          rel="noopener noreferrer"
                          href={source.original_link[lang]}
                        >
                          <TM k="original_report_link" />
                        </a>
                      )}
                      {source.open_data && (
                        <a
                          className="btn btn-ib-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={source.open_data[lang]}
                        >
                          <TM k="open_data_link" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          ))}
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}
