import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { GlossaryEntry } from "src/models/glossary.js";
import { run_template } from "src/models/text.js";

import { tertiaryColor, primaryColor } from "src/core/color_defs.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import {
  SpinnerWrapper,
  KeyConceptList,
  TabbedControls,
  AlertBanner,
  GlossaryIcon,
} from "src/components/";

import { Explorer } from "src/explorer_common/explorer_components.js";
import { get_root } from "src/explorer_common/hierarchy_tools.js";
import { get_col_defs } from "src/explorer_common/resource_explorer_common.js";
import { infograph_href_template } from "src/link_utils.js";

import { hierarchy_scheme_configs } from "./hierarchy_scheme_configs.js";
import {
  text_maker,
  TM,
  planning_year,
  actual_year,
  year_to_route_arg_map,
} from "./utils.js";

const children_grouper = (node, children) => {
  if (node.root) {
    return [{ node_group: children }];
  }

  return _.chain(children)
    .groupBy((child) => child.data.subject.plural())
    .map((node_group, plural) => ({
      display: plural,
      node_group,
    }))
    .value();
};

function render_non_col_content({ node }) {
  const {
    data: { subject, defs },
  } = node;

  const extended_defs = _.compact([
    ...(defs || []),
    subject.old_name && {
      term: text_maker("previously_named"),
      def: subject.old_name,
    },
  ]);

  return (
    <div>
      {!_.isEmpty(extended_defs) && (
        <dl className="dl-horizontal">
          {_.map(
            extended_defs,
            ({ term, def }, ix) =>
              !_.isEmpty(def) && (
                <Fragment key={ix}>
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </Fragment>
              )
          )}
        </dl>
      )}
      {(_.includes(["program", "dept"], subject.level) ||
        subject.is_cr ||
        subject.is_lowest_level_tag) && (
        <div className="ExplorerNode__BRLinkContainer">
          <a href={infograph_href_template(subject)}>
            <TM k="learn_more" />
          </a>
        </div>
      )}
    </div>
  );
}

export default class TagExplorerComponent extends React.Component {
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
      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,

      //scheme props
      hierarchy_scheme,
      is_descending,
      sort_col,
      col_click,
      year,
    } = this.props;

    const explorer_config = {
      column_defs: get_col_defs({ year }),
      onClickExpand: (id) => toggle_node(id),
      is_sortable: true,
      zebra_stripe: true,
      get_non_col_content: render_non_col_content,
      children_grouper,
      col_click,
    };

    const { loading } = this.state;

    const root = get_root(flat_nodes);

    const all_category_props = _.map(
      hierarchy_scheme_configs,
      ({ id, title, text, is_m2m }) => ({
        id,
        title,
        text,
        is_m2m,
        active: id === hierarchy_scheme,
      })
    );
    const current_category = _.find(
      all_category_props,
      (props) => props.active
    );

    const inner_content = (
      <div>
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
          <Explorer
            config={explorer_config}
            root={root}
            col_state={{
              sort_col,
              is_descending,
            }}
          />
        </div>
      </div>
    );

    return (
      <div>
        <TM k="tag_nav_intro_text" el="div" />
        <div className="tabbed-content">
          <TabbedControls
            tab_callback={(key) => {
              const route_base = window.location.href.split("#")[0];

              const new_route = {
                [actual_year]: `#tag-explorer/${hierarchy_scheme}/actual`,
                [planning_year]: `#tag-explorer/${hierarchy_scheme}/planned`,
              }[key];

              window.location.href = `${route_base}${new_route}`;
            }}
            tab_options={[
              {
                key: actual_year,
                label: (
                  <TM
                    k="actual_resources"
                    args={{ year: run_template(actual_year) }}
                  />
                ),
                is_open: year === actual_year,
              },
              {
                key: planning_year,
                label: (
                  <TM
                    k="planned_resources"
                    args={{ year: run_template(planning_year) }}
                  />
                ),
                is_open: year === planning_year,
              },
            ]}
          />
          <div className="tabbed-content__pane">
            <div>
              <ul className="nav nav-justified nav-pills">
                {_.map(all_category_props, (props) => (
                  <li
                    key={props.id}
                    className={classNames(props.active && "active")}
                  >
                    <a
                      href={`#tag-explorer/${props.id}/${year_to_route_arg_map[year]}`}
                    >
                      {props.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <h2 style={{ marginBottom: "10px" }}>
              {current_category && current_category.text}
              {current_category &&
                GlossaryEntry.lookup(current_category.id) && (
                  <GlossaryIcon
                    id={current_category.id}
                    icon_color={tertiaryColor}
                    icon_alt_color={primaryColor}
                  />
                )}
            </h2>
            {current_category.is_m2m && (
              <AlertBanner banner_class="danger">
                <KeyConceptList
                  question_answer_pairs={_.map(
                    [
                      "MtoM_tag_warning_reporting_level",
                      "MtoM_tag_warning_resource_splitting",
                      "MtoM_tag_warning_double_counting",
                    ],
                    (key) => [
                      <TM key={key + "_q"} k={key + "_q"} />,
                      <TM key={key + "_a"} k={key + "_a"} />,
                    ]
                  )}
                />
              </AlertBanner>
            )}
            <div>{inner_content}</div>
          </div>
        </div>
      </div>
    );
  }
}
