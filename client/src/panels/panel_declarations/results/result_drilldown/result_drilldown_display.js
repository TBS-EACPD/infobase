import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import {
  StatusIconTable,
  InlineStatusIconList,
} from "src/panels/panel_declarations/results/result_components.js";
import {
  TM,
  text_maker,
} from "src/panels/panel_declarations/results/result_text_provider.js";
import {
  Indicator,
  result_docs,
} from "src/panels/panel_declarations/results/results_common.js";

import {
  DlItem,
  TabbedControls,
  SpinnerWrapper,
  Format,
  TextAbbrev,
} from "src/components/index.js";

import { lang, is_a11y_mode } from "src/core/injected_build_constants.ts";

import { Explorer } from "src/explorer_common/explorer_components.js";

import { get_root } from "src/explorer_common/hierarchy_tools.js";
import { infograph_href_template } from "src/infographic/infographic_link.js";

import {
  get_type_name,
  ResultNodeContent,
  spending_header,
  fte_header,
  ResultCounts as ResultCountsComponent,
} from "./result_displays.js";
import "./result_drilldown.scss";

const get_non_col_content_func = createSelector(_.property("doc"), (doc) => {
  return ({ node }) => {
    const {
      data: { resources, subject, result, type },
    } = node;

    if (result) {
      return <ResultNodeContent node={node} doc={doc} />;
    }

    const detail_items = _.compact([
      result_docs[doc].has_resources && (
        <DlItem
          key={1}
          term={<span>{spending_header(doc)}</span>}
          def={
            <Format
              type="compact1"
              content={(resources && resources.spending) || 0}
            />
          }
        />
      ),
      result_docs[doc].has_resources && (
        <DlItem
          key={2}
          term={<span>{fte_header(doc)}</span>}
          def={
            <Format
              type="big_int"
              content={(resources && resources.ftes) || 0}
            />
          }
        />
      ),
      !_.isEmpty(subject.old_name) && (
        <DlItem
          key={3}
          term={<TM k="previously_named" />}
          def={subject.old_name}
        />
      ),
    ]);

    return (
      <div>
        {!_.isEmpty(detail_items) && (
          <dl
            className={classNames(
              "dl-horizontal dl-no-bold-dts",
              lang === "fr" || /dp/.test(doc)
                ? "dl-really-long-terms"
                : "dl-long-terms"
            )}
          >
            {detail_items}
          </dl>
        )}
        {_.includes(["program", "dept", "cr"], type) && (
          <div className="ExplorerNode__BRLinkContainer">
            <a href={infograph_href_template(subject)}>
              <TM k="see_infographic" />
            </a>
          </div>
        )}
      </div>
    );
  };
});

const get_children_grouper = createSelector(_.identity, () => {
  return (node, children) => {
    if (node.data.result) {
      //results render their children manually through the non-col content
      return { node_group: [] };
    }

    return _.chain(children)
      .groupBy("data.type")
      .toPairs()
      .sortBy(([type_key, group]) => !_.includes(["dr", "result"], type_key)) //make results show up first
      .map(([type_key, node_group]) => ({
        display: get_type_name(type_key),
        node_group,
      }))
      .value();
  };
});

const get_col_defs = createSelector(
  _.property("doc"),
  _.property("is_status_filter_enabled"),
  _.property("status_key_whitelist"),
  (doc, is_status_filter_enabled, status_key_whitelist) => {
    return [
      {
        id: "name",
        get_val: ({ data, isExpanded }) =>
          isExpanded ? data.name : <TextAbbrev text={data.name} len={115} />,
        width: 250,
        textAlign: "left",
      },
      {
        id: "targets",
        get_val: (node) => {
          const {
            data: { subject, result },
          } = node;

          return (
            /drr/.test(doc) && (
              <div aria-hidden={true} className="status-icon-array">
                <InlineStatusIconList
                  indicators={_.filter(
                    result
                      ? result.indicators
                      : Indicator.get_flat_indicators(subject),
                    (indicator) =>
                      indicator.doc === doc &&
                      (!is_status_filter_enabled ||
                        _.includes(status_key_whitelist, indicator.status_key))
                  )}
                />
              </div>
            )
          );
        },
        width: 200,
        textAlign: "right",
      },
    ];
  }
);

export default class ResultsExplorerDisplay extends React.Component {
  constructor() {
    super();
    this.state = { query: "" };
    this.debounced_set_query = _.debounce(this.debounced_set_query, 500);
  }
  handleQueryChange(new_query) {
    this.setState({
      query: new_query,
      loading_query: new_query.length > 3 ? true : undefined,
    });
    this.debounced_set_query(new_query);
  }
  debounced_set_query(new_query) {
    this.props.set_query(new_query);
    this.timedOutStateChange = setTimeout(() => {
      this.setState({
        loading_query: false,
      });
    }, 500);
  }
  clearQuery() {
    this.setState({ query: "" });
    this.props.clear_query("");
  }
  componentWillUnmount() {
    !_.isUndefined(this.debounced_set_query) &&
      this.debounced_set_query.cancel();
    !_.isUndefined(this.timedOutStateChange) &&
      clearTimeout(this.timedOutStateChange);
    !_.isUndefined(this.expandTimout) && clearTimeout(this.expandTimout);
    !_.isUndefined(this.collapseTimout) && clearTimeout(this.collapseTimout);
  }
  render() {
    const {
      docs_with_data,

      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,
      expand_all,
      collapse_all,
      clear_expanded_collapsed,

      subject,

      //...scheme_props
      data_loading,
      doc,
      set_doc,
      icon_counts,
      toggle_status_status_key,
      clear_status_filter,
      is_status_filter_enabled,
      status_key_whitelist,
    } = this.props;
    const { loading_query, query } = this.state;

    // Weird padding and margins here to get the spinner centered well and cover the "see the data" text while loading
    let inner_content = (
      <div
        style={{
          paddingTop: "100px",
          paddingBottom: "30px",
          marginBottom: "-70px",
        }}
      >
        <SpinnerWrapper config_name={"tabbed_content"} />
      </div>
    );

    if (!data_loading) {
      const root = get_root(flat_nodes);

      const explorer_config = {
        children_grouper: get_children_grouper({ doc }),
        column_defs: get_col_defs({
          doc,
          is_status_filter_enabled,
          status_key_whitelist,
        }),
        shouldHideHeader: true,
        zebra_stripe: true,
        onClickExpand: (id) => toggle_node(id),
        get_non_col_content: get_non_col_content_func({ doc }),
      };
      inner_content = (
        <div>
          <div style={{ marginTop: "10px" }}>
            <ResultCountsComponent {...this.props} />
          </div>
          {/drr/.test(doc) && (
            <div
              style={{
                padding: "10px 10px",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <StatusIconTable
                active_list={status_key_whitelist}
                icon_counts={icon_counts}
                onIconClick={toggle_status_status_key}
                onClearClick={clear_status_filter}
              />
            </div>
          )}
          <div style={{ marginTop: "15px" }}>
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
                placeholder={text_maker("filter_results")}
                onChange={(evt) => this.handleQueryChange(evt.target.value)}
                value={query}
              />
              <div style={{ display: "flex" }}>
                <button
                  type="button"
                  className="btn btn-ib-primary"
                  style={{
                    height: "40px",
                    width: "50%",
                    margin: "5px 2px",
                  }}
                  onClick={() => {
                    // Inside an event handler setState batches all state changes asychronously,
                    // to ensure the spinner shows when we want it to, we need to use setTimeout to force the code
                    // to act asynchronously
                    this.setState({ loading_query: true });
                    this.expandTimout = setTimeout(() => {
                      expand_all(root);
                      this.setState({ loading_query: false });
                    }, 0);
                  }}
                >
                  <span>{text_maker("expand_all")}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ib-primary"
                  style={{
                    height: "40px",
                    width: "50%",
                    margin: "5px 2px",
                  }}
                  onClick={() => {
                    // Same explanation as the expand all button
                    this.setState({ loading_query: true });
                    this.collapseTimout = setTimeout(() => {
                      collapse_all(root);
                      this.setState({ loading_query: false });
                    }, 0);
                  }}
                >
                  <span>{text_maker("collapse_all")}</span>
                </button>
              </div>
              {is_a11y_mode && (
                <input
                  type="submit"
                  name="search"
                  value={text_maker("explorer_search")}
                />
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
            {loading_query && (
              <div className="loading-overlay">
                <div style={{ height: "200px", position: "relative" }}>
                  <SpinnerWrapper config_name={"tabbed_content"} />
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
            <Explorer config={explorer_config} root={root} />
          </div>
        </div>
      );
    }

    const tab_on_click = (doc) =>
      set_doc !== doc && clear_expanded_collapsed() && set_doc(doc, subject);
    return (
      <div className="tabbed-content">
        <TabbedControls
          tab_callback={tab_on_click}
          tab_options={_.map(docs_with_data, (doc_with_data) => ({
            key: doc_with_data,
            label: /drr/.test(doc_with_data) ? (
              <TM
                k="DRR_results_option_title"
                args={{ doc_year: result_docs[doc_with_data].year }}
              />
            ) : (
              <TM
                k="DP_results_option_title"
                args={{ doc_year: result_docs[doc_with_data].year }}
              />
            ),
            is_open: doc_with_data === doc,
          }))}
        />
        <div className="tabbed-content__pane">{inner_content}</div>
      </div>
    );
  }
}
