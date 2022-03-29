import _ from "lodash";
import React from "react";

import {
  FancyUL,
  ShareButton,
  WriteToClipboard,
  FootnoteList,
} from "src/components/index";

import { DataSources } from "src/models/metadata/DataSources";

import { get_source_link } from "src/Datasets/utils";
import { IconCopyLink } from "src/icons/icons";

import { secondaryColor } from "src/style_constants/index";

import { TextMaker } from "./rpb_text_provider";

const ReportDetails = ({ table, def_ready_columns, footnotes }) => {
  const { title: table_title, description: table_description } = table;

  return (
    <section>
      <div>
        <strong>{table_title}</strong>
      </div>
      <div className="mrgn-tp-md">
        <p dangerouslySetInnerHTML={{ __html: table_description }} />
      </div>
      <section className="mrgn-tp-lg">
        <div className="h5">
          <TextMaker text_key="col_defs" />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>
                <TextMaker text_key="col_name" />
              </th>
              <th>
                <TextMaker text_key="col_def" />
              </th>
            </tr>
          </thead>
          <tbody>
            {_.map(def_ready_columns, ({ name, def }) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="rpb-separator" />
      {!_.isEmpty(footnotes) && (
        <div className="mrgn-tp-lg">
          <div className="h5">
            <TextMaker text_key="footnotes" />
          </div>
          <FootnoteList footnotes={footnotes} />
        </div>
      )}
    </section>
  );
};

const ReportDatasets = ({ table }) => {
  const dataset_spans = table.link && [
    <span key={"datasets_header"} className="fancy-ul__title">
      <TextMaker text_key="datasets" />
    </span>,
    <span key={table.id} className="row">
      <div className="col-12 d-flex">
        <span>{table.name}</span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-xs btn-ib-primary btn-responsive-fixed-width"
          href={table.link}
        >
          <TextMaker text_key="open_data_link" />
        </a>
      </div>
    </span>,
  ];

  const data_source_spans = table.source.length > 0 && [
    <span key={"datasets_header"} className="fancy-ul__title">
      <TextMaker text_key="data_sources" />
    </span>,
    ..._.chain(table.source)
      .map((source_key) => {
        const source = DataSources[source_key];

        return source.open_data_link ? (
          <span key={table.id} className="row">
            <div className="col-12 d-flex">
              <a href={get_source_link(source).href}>{source.name}</a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs btn-ib-primary btn-responsive-fixed-width"
                href={source.open_data_link}
              >
                <TextMaker text_key="open_data_link" />
              </a>
            </div>
          </span>
        ) : (
          false
        );
      })
      .filter((span) => span)
      .value(),
  ];

  return (
    <FancyUL className={"rpb-option-fancy-ul"}>
      {_.flatten(
        [dataset_spans, data_source_spans].filter((d) => d && d.length > 1)
      )}
    </FancyUL>
  );
};

const ShareReport = () => (
  <div className="rpb-config-item">
    <ShareButton
      button_class_name={"rpb-heading-utils"}
      url={window.location.href}
      icon_color={secondaryColor}
    />
    <WriteToClipboard
      button_class_name={"rpb-heading-utils"}
      text_to_copy={window.location.href}
      icon_color={secondaryColor}
      IconComponent={IconCopyLink}
    />
  </div>
);

export { ReportDetails, ReportDatasets, ShareReport };
