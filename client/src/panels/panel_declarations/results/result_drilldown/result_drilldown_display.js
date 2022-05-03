import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import {
  StatusIconTable,
  InlineStatusIconList,
} from "src/panels/panel_declarations/results/result_components";
import {
  TM,
  text_maker,
} from "src/panels/panel_declarations/results/result_text_provider";
import {
  Indicator,
  result_docs,
} from "src/panels/panel_declarations/results/results_common";

import {
  DlItem,
  Tabs,
  LeafSpinner,
  Format,
  CheckBox,
} from "src/components/index";

import { lang, is_a11y_mode } from "src/core/injected_build_constants";

import { Explorer } from "src/explorer_common/explorer_components";

import { get_root } from "src/explorer_common/hierarchy_tools";
import { infographic_href_template } from "src/infographic/infographic_href_template";

import {
  get_type_name,
  ResultNodeContent,
  spending_header,
  fte_header,
  ResultCounts as ResultCountsComponent,
} from "./result_displays";

import "./result_drilldown_display.scss";

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
            <a href={infographic_href_template(subject)}>
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
      .sortBy(([type_key, _group]) => !_.includes(["dr", "result"], type_key)) //make results show up first
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
        get_val: ({ data: { name }, is_expanded }) =>
          !is_expanded && name.length > 115
            ? name.substring(0, 115) + "..."
            : name,
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
              <div
                aria-hidden={true}
                className="results-drilldown__status-icon-array"
              >
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
    this.focus_mount_ref = React.createRef();
    this.timeouts = [];
  }
  handleQueryChange(new_query) {
    this.setState({
      query: new_query,
      loading: new_query.length > 3 ? true : undefined,
    });
    this.debounced_set_query(new_query);
  }
  debounced_set_query(new_query) {
    this.props.set_query(new_query);
    this.set_timeout(() => {
      this.setState({
        loading: false,
      });
    }, 500);
  }
  loading_wrapped_dispatch = (dispatch_callback) => () => {
    this.setState({ loading: true });

    // little hacky. dispatch_callback's will be synchronous, and we want this component to be in a loading state while they execute,
    // as they can sometimes run long. The gotcha is that react will batch state changes asynchronously when executed in the same event callback
    // or lifecycle method, which squashes the first.
    // We use a 0 second callback to bump the dispatch_callback and following loading state change in to async execution to bypass react's batching

    this.set_timeout(() => {
      dispatch_callback();
      this.setState({ loading: false });
    }, 0);
  };
  set_timeout = (callback, time) =>
    this.timeouts.push(setTimeout(callback, time));
  clearQuery() {
    this.setState({ query: "" });
    this.props.clear_query("");
  }
  componentWillUnmount() {
    !_.isUndefined(this.debounced_set_query) &&
      this.debounced_set_query.cancel();

    _.forEach(this.timeouts, clearTimeout);
  }
  render() {
    const {
      docs_with_data,

      flat_nodes,

      set_query,
      toggle_node,
      expand_all,
      collapse_all,

      subject,

      //...scheme_props
      data_loading,
      doc,
      set_doc,
      icon_counts,

      is_status_filter_enabled,
      status_key_whitelist,
      toggle_status_status_key,
      clear_status_filter,

      filter_by_gba_plus,
      set_filter_by_gba_plus,
    } = this.props;
    const { loading, query } = this.state;

    let inner_content = (
      <div
        style={{
          paddingTop: "100px",
          paddingBottom: "30px",
        }}
      >
        <LeafSpinner config_name={"subroute"} />
      </div>
    );

    if (!data_loading) {
      const root_node = get_root(flat_nodes);

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
        <div className="results-drilldown">
          <div className="results-drilldown-controls">
            <div>
              <ResultCountsComponent {...this.props} />
            </div>
            {/drr/.test(doc) && (
              <div>
                <StatusIconTable
                  active_list={status_key_whitelist}
                  icon_counts={icon_counts}
                  onIconClick={toggle_status_status_key}
                  onClearClick={clear_status_filter}
                />
              </div>
            )}
            <div>
              <form
                onSubmit={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  set_query(evt.target.querySelector("input").value);
                  this.focus_mount_ref.focus();
                }}
              >
                <input
                  className="form-control input-lg"
                  style={{ width: "100%" }}
                  type="text"
                  aria-label={text_maker("explorer_search_is_optional")}
                  placeholder={text_maker("filter_results")}
                  onChange={(evt) => this.handleQueryChange(evt.target.value)}
                  value={query}
                />
                {is_a11y_mode && (
                  <input
                    type="submit"
                    name="search"
                    value={text_maker("explorer_search")}
                  />
                )}
              </form>
            </div>
            {result_docs[doc].can_have_gba_plus && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <CheckBox
                  id="filter-to-gba-plus-checkbox"
                  label={<TM k="gba_filter" />}
                  active={filter_by_gba_plus}
                  onClick={this.loading_wrapped_dispatch(() => {
                    set_filter_by_gba_plus(!filter_by_gba_plus);
                  })}
                />
              </div>
            )}
            <div className="results-drilldown-controls__expand-collapse">
              <button
                type="button"
                className="btn btn-ib-primary"
                onClick={this.loading_wrapped_dispatch(() =>
                  expand_all(root_node)
                )}
              >
                <span>{text_maker("expand_all")}</span>
              </button>
              <button
                type="button"
                className="btn btn-ib-primary"
                onClick={this.loading_wrapped_dispatch(() =>
                  collapse_all(root_node)
                )}
              >
                <span>{text_maker("collapse_all")}</span>
              </button>
            </div>
          </div>
          <div
            tabIndex={-1}
            className="explorer-focus-mount"
            ref={this.focus_mount_ref}
            style={{ position: "relative" }}
            aria-label={text_maker("explorer_focus_mount")}
          >
            {loading && (
              <div className="loading-overlay">
                <div style={{ height: "200px" }}>
                  <LeafSpinner config_name={"subroute"} />
                </div>
              </div>
            )}
            <div className={classNames(loading && "d-none")}>
              {_.isEmpty(root_node.children) && (
                <div
                  style={{
                    fontWeight: "500",
                    fontSize: "1.5em",
                    textAlign: "center",
                  }}
                >
                  <TM k="filters_no_results" />
                </div>
              )}
              <Explorer config={explorer_config} root={root_node} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <Tabs
        open_tab_key={doc}
        tabs={_.chain(docs_with_data)
          .map((doc_with_data) => [
            doc_with_data,

            /drr/.test(doc_with_data) ? (
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
          ])
          .fromPairs()
          .value()}
        tab_open_callback={(doc) => set_doc !== doc && set_doc(doc, subject)}
      >
        {inner_content}
      </Tabs>
    );
  }
}
