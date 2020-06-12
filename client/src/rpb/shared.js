import { TextMaker, text_maker } from "./rpb_text_provider.js";
import { sources as all_sources } from "../metadata/data_sources.js";
import {
  DeptSearch,
  FancyUL,
  ShareButton,
  WriteToClipboard,
  FootnoteList,
} from "../components/index.js";
import { IconCopyLink } from "../icons/icons.js";

const ReportDetails = ({
  table,
  dimension,
  filter,
  preferDeptBreakout,
  mode,
  subject,
  columns,
  preferTable,
  def_ready_columns,
  footnotes,
}) => {
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

const ReportDatasets = ({ table, subject }) => {
  const dataset_spans = table.link[window.lang] && [
    <span key={"datasets_header"} className="fancy-ul__title">
      <TextMaker text_key="metadata" />
    </span>,
    <span key={table.id} className="frow">
      <span>{table.name}</span>
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-xs btn-ib-primary btn-responsive-fixed-width"
        href={table.link[window.lang]}
      >
        <TextMaker text_key="open_data_link" />
      </a>
    </span>,
  ];

  const data_source_spans = table.source.length > 0 && [
    <span key={"datasets_header"} className="fancy-ul__title">
      <TextMaker text_key="data_sources" />
    </span>,
    ..._.chain(table.source)
      .map((source) => {
        return all_sources[source].open_data ? (
          <span key={table.id} className="frow">
            <a href={"#metadata/" + source}>{all_sources[source].title()}</a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xs btn-ib-primary btn-responsive-fixed-width"
              href={all_sources[source].open_data[window.lang]}
            >
              <TextMaker text_key="open_data_link" />
            </a>
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
        [dataset_spans, data_source_spans].filter((d) => d.length > 1)
      )}
    </FancyUL>
  );
};

const ShareReport = () => (
  <div className="rpb-config-item">
    <ShareButton
      button_class_name={"panel-heading-utils"}
      url={window.location.href}
      icon_color={window.infobase_color_constants.secondaryColor}
    />
    <WriteToClipboard
      button_class_name={"panel-heading-utils"}
      text_to_copy={window.location.href}
      icon_color={window.infobase_color_constants.secondaryColor}
      IconComponent={IconCopyLink}
    />
  </div>
);

//the parent flexbox styling screws stuff up and makes it impossible to center vertically, top padding tweaked to correct
const SubjectFilterPicker = ({ subject, onSelect }) => (
  <div
    style={{ paddingTop: "10px" }}
    className="centerer md-half-width row-opition-content-search"
  >
    <DeptSearch
      include_gov={true}
      onSelect={(subject) => {
        onSelect(subject);
      }}
      search_text={text_maker(
        subject.guid === "gov_gov" ? "org_search" : "another_org_search"
      )}
    />
  </div>
);

const NoDataMessage = () => (
  <div className="well large_panel_text">
    <div style={{ textAlign: "center" }}>
      <TextMaker text_key="rpb_no_data" />
    </div>
  </div>
);

export {
  ReportDetails,
  ReportDatasets,
  ShareReport,
  SubjectFilterPicker,
  NoDataMessage,
};
