import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import {
  LeafSpinner,
  KeyConceptList,
  Tabs,
  AlertBanner,
  GlossaryIcon,
  PinnedFAQ,
} from "src/components/index";
import { create_text_maker_component } from "src/components/misc_util_components";

import { glossaryEntryStore } from "src/models/glossary";
import { run_template } from "src/models/text";

import { is_a11y_mode } from "src/core/injected_build_constants";

import common_faq from "src/common_text/faq/common_questions.yaml";
import tag_faq from "src/common_text/faq/tagging_questions.yaml";

import { Explorer } from "src/explorer_common/explorer_components";
import { get_root } from "src/explorer_common/hierarchy_tools";
import { get_col_defs } from "src/explorer_common/resource_explorer_common";
import { infographic_href_template } from "src/link_utils";
import { tertiaryColor, primaryColor } from "src/style_constants/index";

import { hierarchy_scheme_configs } from "./hierarchy_scheme_configs";
import {
  text_maker,
  TM,
  planning_year,
  actual_year,
  year_to_route_arg_map,
} from "./utils";

const children_grouper = (node, children) => {
  if (node.root) {
    return [{ node_group: children }];
  }

  return _.chain(children)
    .groupBy((child) => child.data.subject.subject_name)
    .map((node_group, subject_name) => ({
      display: subject_name,
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
        <dl className="row" style={{ margin: 0 }}>
          {_.map(
            extended_defs,
            ({ term, def }, ix) =>
              !_.isEmpty(def) && (
                <Fragment key={ix}>
                  <hr className="col-12 col-lg-12" />
                  <dt className="col-12 col-lg-2" style={{ paddingLeft: 0 }}>
                    {term}
                  </dt>
                  <dd
                    className="col-12 col-lg-10"
                    style={{ paddingRight: "10px", paddingLeft: 0 }}
                  >
                    {def}
                  </dd>
                </Fragment>
              )
          )}
        </dl>
      )}
      {(_.includes(["program", "dept"], subject.subject_type) ||
        subject.is_cr ||
        subject.has_programs) && (
        <div className="ExplorerNode__BRLinkContainer">
          <a href={infographic_href_template(subject)}>
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
                <LeafSpinner config_name={"route"} />
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

    const q_a_key_pairs = [
      ["what_is_tagging_q", "what_is_tagging_a"],
      ["what_is_prog_tagging_q", "what_is_prog_tagging_a"],
      ["what_tags_are_available_q", "what_tags_are_available_a"],
      ["what_are_how_we_help_q", "what_are_how_we_help_a"],
      ["what_are_CR_q", "what_are_CR_a"],
    ];

    const { TM: FAQ_TM } = create_text_maker_component([tag_faq, common_faq]);

    return (
      <div>
        <TM k="tag_nav_intro_text" el="div" />
        <PinnedFAQ
          q_a_key_pairs={q_a_key_pairs}
          TM={FAQ_TM}
          background_color={primaryColor}
        />
        <Tabs
          open_tab_key={year}
          tabs={{
            [actual_year]: (
              <TM
                k="actual_resources"
                args={{ year: run_template(actual_year) }}
              />
            ),
            [planning_year]: (
              <TM
                k="planned_resources"
                args={{ year: run_template(planning_year) }}
              />
            ),
          }}
          tab_open_callback={(key) => {
            const route_base = window.location.href.split("#")[0];

            const new_route = {
              [actual_year]: `#tag-explorer/${hierarchy_scheme}/actual`,
              [planning_year]: `#tag-explorer/${hierarchy_scheme}/planned`,
            }[key];

            window.location.href = `${route_base}${new_route}`;
          }}
        >
          <div>
            <ul className="nav nav-justified nav-pills">
              {_.map(all_category_props, (props) => (
                <li
                  key={props.id}
                  className={classNames(props.active && "active", "nav-item")}
                >
                  <a
                    className="nav-link"
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
              glossaryEntryStore.has(current_category.id) && (
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
                    [
                      "MtoM_tag_warning_reporting_level_q",
                      "MtoM_tag_warning_reporting_level_a",
                    ],
                    [
                      "MtoM_tag_warning_resource_splitting_q",
                      "MtoM_tag_warning_resource_splitting_a",
                    ],
                    [
                      "MtoM_tag_warning_double_counting_q",
                      "MtoM_tag_warning_double_counting_a",
                    ],
                  ],
                  ([q_key, a_key]) => [
                    <TM key={q_key} k={q_key} />,
                    <TM key={a_key} k={a_key} />,
                  ]
                )}
              />
            </AlertBanner>
          )}
          <div>{inner_content}</div>
        </Tabs>
      </div>
    );
  }
}
