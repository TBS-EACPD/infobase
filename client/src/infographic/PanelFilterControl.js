import _ from "lodash";
import React from "react";

import {
  create_text_maker_component,
  Details,
  LabeledBox,
  TagCloud,
} from "src/components/index.js";

import { tertiaryColor } from "src/core/color_defs.js";
import { Table } from "src/core/TableClass.js";

import { SelectAllControl } from "src/charts/legends/index.js";

import { PanelRegistry } from "src/panels/PanelRegistry.js";

import footnote_text from "../models/footnotes/footnote_topics.yaml";

import text from "./PanelFilterControl.yaml";

const { text_maker, TM } = create_text_maker_component([text, footnote_text]);

const get_default_table_tag_state = ({ panel_keys, subject }) =>
  _.chain(panel_keys)
    .flatMap(
      (panel_key) => PanelRegistry.lookup(panel_key, subject.level)?.depends_on
    )
    .uniq()
    .map((table_id) => [table_id, false])
    .fromPairs()
    .value();

const get_default_footnote_tags = ({ panel_keys, subject }) => {
  return _.chain(panel_keys)
    .flatMap(
      (panel_key) => PanelRegistry.lookup(panel_key, subject.level).footnotes
    )
    .compact()
    .flatMap("topic_keys")
    .uniq()
    .map((topic_key) => [topic_key, false])
    .fromPairs()
    .value();
};
const get_tags = (tags, get_label) =>
  _.chain(tags)
    .map((active, id) => ({
      id: id,
      label: get_label(id),
      active,
    }))
    .sortBy("label")
    .value();
const PanelFilterControlTag = ({
  tags,
  label,
  onSelectTag,
  SelectAllOnClick,
  SelectNoneOnClick,
}) => (
  <LabeledBox
    label={label}
    children={
      <div>
        <TagCloud tags={tags} onSelectTag={onSelectTag} />
        <div
          style={{
            borderTop: `1px dashed ${tertiaryColor}`,
            padding: "10px 0px 10px 5px",
          }}
        >
          <SelectAllControl
            SelectAllOnClick={SelectAllOnClick}
            SelectNoneOnClick={SelectNoneOnClick}
          />
        </div>
      </div>
    }
  />
);

export default class PanelFilterControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table_tags: get_default_table_tag_state(props),
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const potentially_new_table_tag_state = get_default_table_tag_state(
      nextProps
    );

    const next_table_ids = _.keys(potentially_new_table_tag_state);
    const prev_table_ids = _.keys(prevState.table_tags);
    const table_set_has_changed =
      next_table_ids.length !== prev_table_ids.length ||
      _.some(
        next_table_ids,
        (table_id) => !_.includes(prev_table_ids, table_id)
      );

    if (table_set_has_changed) {
      // HEADS UP: this case isn't currently reached, as the current Infographic lifecycle
      // unmounts this component in the intermediate loading state, which premepts a single
      // instance from ever receiving a different set of table tags...
      // Handling it out of caution anyway, should be safe through any Infographic refactors that
      // don't directly involve this component

      return {
        table_tags: potentially_new_table_tag_state,
      };
    } else {
      return null;
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { table_tags, footnote_tags } = this.state;
    return (
      table_tags !== nextState.table_tags ||
      footnote_tags !== nextState.footnote_tags
    );
  }
  componentDidMount() {
    this.setState({ footnote_tags: get_default_footnote_tags(this.props) });
  }
  componentDidUpdate() {
    this.props.set_panel_filter(this.panel_filter_factory());
  }
  render() {
    const { panel_keys, subject, is_included_filter } = this.props;
    const { table_tags, footnote_tags } = this.state;

    const panel_filter = this.panel_filter_factory();

    const static_panel_count = _.chain(panel_keys)
      .map(
        (panel_key) => PanelRegistry.lookup(panel_key, subject.level).is_static
      )
      .compact()
      .value().length;
    const tag_props = {
      datasets: {
        tags: get_tags(table_tags, (table_id) => Table.lookup(table_id).name),
        label: text_maker("filter_by_datasets"),
        onSelectTag: (table_id) =>
          this.setState({
            table_tags: { ...table_tags, [table_id]: !table_tags[table_id] },
          }),
        SelectAllOnClick: () =>
          this.setState({
            table_tags: _.mapValues(table_tags, _.constant(true)),
          }),
        SelectNoneOnClick: () =>
          this.setState({
            table_tags: _.mapValues(table_tags, _.constant(false)),
          }),
      },
      footnotes: {
        tags: get_tags(footnote_tags, (topic) => text_maker(topic)),
        label: text_maker("filter_by_footnotes"),
        onSelectTag: (footnote_topic) =>
          this.setState({
            footnote_tags: {
              ...footnote_tags,
              [footnote_topic]: !footnote_tags[footnote_topic],
            },
          }),
        SelectAllOnClick: () =>
          this.setState({
            footnote_tags: _.mapValues(footnote_tags, _.constant(true)),
          }),
        SelectNoneOnClick: () =>
          this.setState({
            footnote_tags: _.mapValues(footnote_tags, _.constant(false)),
          }),
      },
    };

    return (
      <Details
        summary_content={
          <div>
            <TM style={{ fontSize: 16 }} k="filter_panels" />{" "}
            <TM
              className="panel-status-text"
              k="panels_status"
              args={{
                total_number_of_panels: panel_keys.length - static_panel_count,
                number_of_active_panels:
                  panel_filter(panel_keys).length - static_panel_count,
              }}
            />
          </div>
        }
        persist_content={true}
        content={
          <div>
            {is_included_filter.datasets && (
              <PanelFilterControlTag {...tag_props.datasets} />
            )}
            {is_included_filter.footnotes && (
              <PanelFilterControlTag {...tag_props.footnotes} />
            )}
          </div>
        }
      />
    );
  }
  panel_filter_factory = () => {
    const { table_tags, footnote_tags } = this.state;
    const { subject } = this.props;

    const active_table_ids = _.chain(table_tags)
      .pickBy(_.identity)
      .keys()
      .value();
    const active_footnote_topics = _.chain(footnote_tags)
      .pickBy(_.identity)
      .keys()
      .value();

    const all_filters_are_empty =
      _.isEmpty(active_table_ids) && _.isEmpty(active_footnote_topics);
    const all_filters_are_applied =
      active_table_ids.length === _.size(table_tags) &&
      active_footnote_topics.length === _.size(footnote_tags);

    if (all_filters_are_empty || all_filters_are_applied) {
      return _.identity;
    }

    return (panel_keys) =>
      _.filter(panel_keys, (panel_key) => {
        const panel = PanelRegistry.lookup(panel_key, subject.level);
        return (
          panel.is_static ||
          _.intersection(panel.depends_on, active_table_ids).length > 0 ||
          _.intersection(
            _.chain(panel.footnotes).flatMap("topic_keys").uniq().value(),
            active_footnote_topics
          ).length > 0
        );
      });
  };
}
PanelFilterControl.defaultProps = {
  is_included_filter: {
    datasets: true,
    footnotes: true,
  },
};
