import classNames from "classnames";
import _ from "lodash";
import React from "react";

import {
  SpinnerWrapper,
  FootnoteList,
  Format,
  RadioButtons,
  LabeledBox,
  CheckBox,
  Details,
} from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.js";

import { lang, is_a11y_mode } from "src/core/injected_build_constants.js";

import { Explorer } from "src/explorer_common/explorer_components.js";
import { get_root } from "src/explorer_common/hierarchy_tools.js";
import { infograph_href_template, rpb_link } from "src/link_utils.js";
import { sources } from "src/metadata/data_sources.js";

import {
  text_maker,
  TM,
  current_doc_is_mains,
  current_sups_letter,
} from "./utils.js";

const { estimates_docs } = businessConstants;

const DetailedAmountsByDoc = ({ amounts_by_doc }) => {
  const sorted_items = _.sortBy(
    amounts_by_doc,
    ({ doc_code }) => estimates_docs[doc_code].order
  );

  return (
    <section className="LastYearEstimatesSection">
      <div>
        <div className="h6 heavy-weight">
          <TM k="doc_breakout_details" />
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th scope="col">
                <TM k="estimates_doc" />
              </th>
              <th scope="col">
                <TM k="last_year_authorities" />
              </th>
              <th scope="col">
                <TM k="this_year_authorities" />
              </th>
            </tr>
          </thead>
          <tbody>
            {_.map(
              sorted_items,
              ({ doc_code, amount_last_year, amount_this_year }) => (
                <tr key={doc_code}>
                  <td>{estimates_docs[doc_code][lang]}</td>
                  <td>
                    {(amount_last_year || amount_last_year === 0) && (
                      <Format type="compact2" content={amount_last_year} />
                    )}
                  </td>
                  <td>
                    {(amount_this_year || amount_this_year === 0) && (
                      <Format type="compact2" content={amount_this_year} />
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const get_non_col_content = ({ node }) => {
  const subject = _.get(node, "data.subject");
  const footnotes = _.get(node, "data.footnotes");
  const amounts_by_doc = _.get(node, "data.amounts_by_doc");

  return (
    <div>
      {!_.isEmpty(amounts_by_doc) && (
        <div>
          <DetailedAmountsByDoc amounts_by_doc={amounts_by_doc} />
        </div>
      )}
      {!_.isEmpty(footnotes) && (
        <div className={classNames(subject && "mrgn-bttm-lg")}>
          <Details
            summary_content={<TM k="footnotes" />}
            content={<FootnoteList footnotes={footnotes} />}
          />
        </div>
      )}
      {subject && (
        <div className="ExplorerNode__BRLinkContainer">
          <a href={infograph_href_template(subject)}>
            <TM k="infographic_for" args={{ subject }} />
          </a>
        </div>
      )}
    </div>
  );
};

export default class EstimatesExplorerComponent extends React.Component {
  constructor() {
    super();
    this.state = { _query: "" };
    this.debounced_set_query = _.debounce(this.debounced_set_query, 500);
  }
  handleQueryChange(new_query) {
    this.setState({
      _query: new_query,
      loading: new_query.length > 3 ? true : undefined,
    });
    this.debounced_set_query(new_query);
  }
  debounced_set_query(new_query) {
    this.props.set_query(new_query);
    this.timedOutStateChange = setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 500);
  }
  componentWillUnmount() {
    !_.isUndefined(this.debounced_set_query) &&
      this.debounced_set_query.cancel();
    !_.isUndefined(this.timedOutStateChange) &&
      clearTimeout(this.timedOutStateChange);
  }
  clearQuery() {
    this.setState({ _query: "" });
    this.props.clear_query("");
  }
  render() {
    const {
      history,

      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,

      is_descending,
      sort_col,
      col_click,

      //scheme props
      doc_code,
      show_stat,
      toggle_stat_filter,
      use_legal_titles,
      toggle_legal_titles,
      column_defs,
      h7y_layout,
    } = this.props;

    const { loading } = this.state;

    const root = get_root(flat_nodes);

    const explorer_config = {
      column_defs,
      get_non_col_content,
      onClickExpand: (id) => toggle_node(id),
      is_sortable: true,
      zebra_stripe: true,
      col_click,
    };

    return (
      <div>
        <div className="medium-panel-text mrgn-tp-lg">
          <TM
            k="diff_view_top_text"
            args={{ current_doc_is_mains, current_sups_letter }}
          />
        </div>
        <h2>
          <TM k="general_info" />
        </h2>
        <div className="medium-panel-text">
          <TM k="estimates_expl" />
        </div>
        <div
          style={{
            marginBottom: "15px",
          }}
        >
          <LabeledBox label={<TM k="choose_grouping_scheme" />}>
            <div className="centerer">
              <RadioButtons
                options={[
                  {
                    id: "org",
                    active: h7y_layout === "org",
                    display: <TM k="by_org" />,
                  },
                  {
                    id: "item_type",
                    active: h7y_layout === "item_type",
                    display: <TM k="by_item_type" />,
                  },
                ]}
                onChange={(id) => history.push(`/compare_estimates/${id}`)}
              />
            </div>
          </LabeledBox>
        </div>
        <div>
          <form
            style={{ marginBottom: "15px" }}
            onSubmit={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              set_query(evt.target.querySelector("input").value);
              this.refs.focus_mount.focus();
            }}
          >
            <input
              aria-label={text_maker("explorer_search_is_optional")}
              className="form-control input-lg"
              type="text"
              style={{ width: "100%" }}
              placeholder={text_maker("everything_search_placeholder")}
              onChange={(evt) => this.handleQueryChange(evt.target.value)}
            />
            {is_a11y_mode && (
              <input
                type="submit"
                name="search"
                value={text_maker("explorer_search")}
              />
            )}
            {h7y_layout === "org" && (
              <div className="estimates-checkbox-row medium-panel-text">
                <CheckBox
                  label={text_maker("show_only_votes")}
                  active={!show_stat}
                  onClick={toggle_stat_filter}
                  checkmark_vertical_align={6}
                  checkbox_style={{ marginTop: 4 }}
                />
                <CheckBox
                  active={use_legal_titles}
                  onClick={toggle_legal_titles}
                  label={text_maker("use_legal_title")}
                  checkmark_vertical_align={6}
                  checkbox_style={{ marginTop: 4 }}
                />
              </div>
            )}
          </form>
        </div>
        <div
          tabIndex={-1}
          className="explorer-focus-mount"
          ref="focus_mount"
          style={{ position: "relative" }}
          aria-label={text_maker("explorer_focus_mount")}
        >
          {loading && (
            <div className="loading-overlay">
              <div style={{ height: "200px", position: "relative" }}>
                <SpinnerWrapper config_name={"sub_route"} />
              </div>
            </div>
          )}
          {is_filtering && _.isEmpty(root.children) && (
            <div
              style={{
                fontWeight: "500",
                fontSize: "1.5em",
                textAlign: "center",
              }}
            >
              <TM k="search_no_results" />
            </div>
          )}
          {!show_stat && (
            <div className="DiffFilterViewAlert">
              <TM k="showing_only_votes" />
            </div>
          )}
          <Explorer
            config={explorer_config}
            root={root}
            col_state={{
              sort_col,
              is_descending,
            }}
            min_width={525}
          />
        </div>
        <div className="h3" style={{ textAlign: "center" }}>
          <TM
            k="estimates_rpb_link"
            args={{
              href: rpb_link({
                table: "table8",
                columns: [
                  doc_code === "IM"
                    ? "{{est_next_year}}_estimates"
                    : "{{est_in_year}}_estimates",
                ],
                dimension: "by_estimates_doc",
                filter: estimates_docs[doc_code][lang],
              }),
            }}
          />
          <br />
          <TM
            k="estimates_source_link"
            args={{ href: sources.ESTIMATES.open_data[lang] }}
          />
        </div>
      </div>
    );
  }
}
