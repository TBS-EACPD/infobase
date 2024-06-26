import _ from "lodash";
import React from "react";

import { PanelRegistry } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  Details,
  LabeledBox,
  TagCloud,
  SelectAllControl,
} from "src/components/index";

import { tertiaryColor } from "src/style_constants/index";
import { Table } from "src/tables/TableClass";

import text from "./PanelFilterControl.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const get_default_table_tag_state = ({ panel_keys, subject }) =>
  _.chain(panel_keys)
    .flatMap(
      (panel_key) =>
        PanelRegistry.lookup(panel_key, subject.subject_type)
          ?.legacy_table_dependencies
    )
    .uniq()
    .map((table_id) => [table_id, false])
    .fromPairs()
    .value();

const should_excluded_from_filtering = (panel) => panel.is_meta_panel;

export default class PanelFilterControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table_tags: get_default_table_tag_state(props),
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const potentially_new_table_tag_state =
      get_default_table_tag_state(nextProps);

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
    return this.state.table_tags !== nextState.table_tags;
  }
  componentDidUpdate() {
    this.props.set_panel_filter(this.panel_filter_factory());
  }
  render() {
    const { panel_keys, subject } = this.props;
    const { table_tags } = this.state;

    const panel_filter = this.panel_filter_factory();

    const tags = _.chain(table_tags)
      .map((active, table_id) => ({
        id: table_id,
        label: Table.store.lookup(table_id).name,
        active,
      }))
      .sortBy("label")
      .value();

    const excluded_panel_count = _.filter(panel_keys, (key) =>
      should_excluded_from_filtering(
        PanelRegistry.lookup(key, subject.subject_type)
      )
    ).length;

    return (
      <Details
        summary_content={
          <div>
            <TM k="filter_panels" />{" "}
            <TM
              className="panel-status-text"
              k="panels_status"
              args={{
                total_number_of_panels:
                  panel_keys.length - excluded_panel_count,
                number_of_active_panels:
                  panel_filter(panel_keys).length - excluded_panel_count,
              }}
            />
          </div>
        }
        persist_content={true}
        content={
          <LabeledBox
            label={text_maker("filter_panels_description")}
            children={
              <div>
                <TagCloud tags={tags} onSelectTag={this.onSelect} />
                <div
                  style={{
                    borderTop: `1px dashed ${tertiaryColor}`,
                    padding: "10px 0px 10px 5px",
                  }}
                >
                  <SelectAllControl
                    SelectAllOnClick={this.onSelectAll}
                    SelectNoneOnClick={this.onSelectNone}
                  />
                </div>
              </div>
            }
          />
        }
      />
    );
  }
  onSelect = (table_id) => {
    const { table_tags } = this.state;

    this.setState({
      table_tags: { ...table_tags, [table_id]: !table_tags[table_id] },
    });
  };
  onSelectAll = () => {
    const { table_tags } = this.state;

    this.setState({
      table_tags: _.mapValues(table_tags, _.constant(true)),
    });
  };
  onSelectNone = () => {
    const { table_tags } = this.state;

    this.setState({
      table_tags: _.mapValues(table_tags, _.constant(false)),
    });
  };
  panel_filter_factory = () => {
    const { table_tags } = this.state;
    const { subject } = this.props;

    const active_table_ids = _.chain(table_tags)
      .pickBy(_.identity)
      .keys()
      .value();

    if (
      _.isEmpty(active_table_ids) ||
      active_table_ids.length === _.size(table_tags)
    ) {
      return _.identity;
    }

    return (panel_keys) =>
      _.filter(panel_keys, (panel_key) => {
        const panel = PanelRegistry.lookup(panel_key, subject.subject_type);
        return (
          should_excluded_from_filtering(panel) ||
          _.intersection(panel.legacy_table_dependencies, active_table_ids)
            .length > 0
        );
      });
  };
}
