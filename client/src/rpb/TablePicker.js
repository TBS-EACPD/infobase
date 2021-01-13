import "../components/LabeledBox.scss";
import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { TransitionGroup, CSSTransition } from "react-transition-group";

import d3 from "src/core/d3-bundle.js";

import { AlertBanner, GlossaryIcon } from "../components";
import { Table } from "../core/TableClass.js";
import { GlossaryEntry } from "../models/glossary.js";

import { TextMaker, text_maker } from "./rpb_text_provider.js";
import {
  categories,
  concepts_by_category,
  concept_filter,
} from "./table_picker_concept_filter.js";
import "./TablePicker.scss";

const BrokenLinkBanner = () => (
  <AlertBanner banner_class={"warning"}>
    <TextMaker text_key="table_picker_broken_link_warning" />
  </AlertBanner>
);

export const AccessibleTablePicker = ({
  tables,
  onSelect,
  selected,
  broken_url,
}) => (
  <Fragment>
    {broken_url && <BrokenLinkBanner />}
    <select
      aria-labelledby="picker-label"
      className="form-control form-control-ib rpb-simple-select"
      value={selected}
      onChange={(evt) => onSelect(evt.target.value)}
    >
      <option value="select_data">{text_maker("rpb_pick_data")}</option>
      {_.map(tables, ({ id, name }) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  </Fragment>
);

function toggleArrayElement(arr, el) {
  return _.includes(arr, el) ? _.without(arr, el) : arr.concat(el);
}

/* 
  props:
    onSelect : table_id =>  
*/

class TablePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_concepts: [],
    };

    this.tables = _.chain(Table.get_all())
      .reject("reference_table")
      .map((t) => ({
        id: t.id,
        display: t.name,
        description: (
          <div dangerouslySetInnerHTML={{ __html: t.short_description }} />
        ),
      }))
      .value();

    //note that a concept without tables will not get included here.
    this.linkage = _.chain(Table.get_all())
      .reject("reference_table")
      .map((table_obj) =>
        _.map(_.filter(table_obj.tags, concept_filter), (concept) => ({
          table_id: table_obj.id,
          concept_id: concept,
        }))
      )
      .flatten()
      .value();

    //note that this will only include concepts that are actually linked to stuff.
    this.concepts = _.chain(this.linkage)
      .map("concept_id")
      .uniqBy()
      .map((concept_id) => ({
        id: concept_id,
      }))
      .value();
  }
  render() {
    const { broken_url } = this.props;

    const { active_concepts } = this.state;

    const { linkage, concepts, tables } = this;

    const tables_to_render = _.isEmpty(active_concepts)
      ? tables
      : _.chain(active_concepts)
          .map((concept_id) =>
            _.chain(linkage).filter({ concept_id }).map("table_id").value()
          )
          .thru((groups) => _.intersection.apply(null, groups))
          .map((id) => _.find(tables, { id }))
          .compact()
          .value();

    const concepts_to_display = _.chain(linkage)
      .filter(({ table_id }) => _.find(tables, { id: table_id }))
      .map("concept_id")
      .uniqBy()
      .map((id) => _.find(concepts, { id }))
      .map(({ id }) => ({
        id,
        active: _.includes(active_concepts, id),
      }))
      .sortBy("topic")
      .value();

    const relevant_linkage = _.chain(linkage)
      .filter(({ table_id }) => _.find(tables_to_render, { id: table_id }))
      .map(({ concept_id, table_id }) => ({
        tag_id: concept_id,
        item_id: table_id,
      }))
      .value();

    return (
      <div ref="main" id="tbp-main">
        <h1 id="tbp-title">
          <TextMaker text_key="table_picker_title" />
        </h1>
        {broken_url && <BrokenLinkBanner />}
        <p className="medium-panel-text">
          <TextMaker text_key="table_picker_top_instructions" />
        </p>
        <div>
          <TaggedItemCloud
            exiting={this.state.exiting}
            items={tables_to_render}
            tags={concepts_to_display}
            item_tag_linkage={relevant_linkage}
            onSelectTag={(concept_id) => {
              this.selectConcept(concept_id);
            }}
            onSelectItem={(table_id) => {
              this.fadeOutAndSelectTable(table_id);
            }}
            noItemsMessage={
              <TextMaker text_key="table_picker_no_tables_found" />
            }
          />
        </div>
      </div>
    );
  }
  fadeOutAndSelectTable = (table_id) => {
    this.setState({ exiting: true });
    const initialHeight = this.refs.main.offsetHeight;
    d3.select(this.refs.main)
      .style("max-height", initialHeight + "px")
      .style("opacity", 1)
      .transition()
      .duration(750)
      .style("max-height", "1px")
      .style("opacity", 1e-6)
      .on("end", () => {
        this.props.onSelect(table_id);
      });
  };
  selectConcept(concept_id) {
    const new_active_concepts = toggleArrayElement(
      this.state.active_concepts,
      concept_id
    );
    this.setState({ active_concepts: new_active_concepts });
  }
  selectTable(selected_table) {
    const { onSelect } = this.props;
    this.setState({ selected_table });
    if (_.isFunction(onSelect)) {
      onSelect(selected_table);
    }
  }
}

//stateless presentational component
class TaggedItemCloud extends React.Component {
  render() {
    const {
      tags,
      items,
      item_tag_linkage,
      onSelectItem,
      onSelectTag,
      noItemsMessage,
    } = this.props;

    const flat_items = _.map(items, ({ display, id, description }) => (
      <div key={id}>
        <div className="item-card">
          <div className="item-title centerer">{display}</div>
          <div className="item-card-mat">
            <div>
              <div className="item-card-footer">
                <div className="item-tag-container">
                  <span className="sr-only">
                    <u>
                      <TextMaker text_key="covered_concepts" />
                    </u>
                  </span>
                  <div className="item-tags">
                    {_.chain(item_tag_linkage)
                      .filter({ item_id: id })
                      .map(({ tag_id }) => _.find(tags, { id: tag_id }))
                      .map(({ id, active }) => (
                        <div
                          key={id}
                          className={classNames(
                            active && "active",
                            active && "active",
                            "tag-badge",
                            "tag-badge--solid"
                          )}
                        >
                          <TextMaker text_key={id} />
                        </div>
                      ))
                      .value()}
                  </div>
                </div>
                <div className="item-select">
                  <button
                    onClick={() => onSelectItem(id)}
                    className="btn btn-ib-primary btn-xs"
                  >
                    <TextMaker text_key="select_table" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));

    const item_column_count = 3;
    const items_split = _.chain(flat_items)
      .map((item, ix) => ({ item, ix }))
      .groupBy(({ item, ix }) => ix % item_column_count)
      .map((group) => _.map(group, "item"))
      // placeholder groups containing empty divs added so that exiting groups' columns will transition out
      .thru((item_split) =>
        _.chain()
          .range(item_column_count)
          .fill([<div key="placeholder" />])
          .map((placeholder_group, group_index) =>
            group_index >= item_split.length
              ? placeholder_group
              : item_split[group_index]
          )
          .value()
      )
      .value();

    const tags_by_category = _.fromPairs(
      _.map(categories, (cat) => [
        cat,
        _.chain(concepts_by_category[cat])
          .map((c) => _.filter(tags, { id: c }))
          .flatten()
          .value(),
      ])
    );

    return (
      <div>
        <div style={{ padding: "0px" }}>
          {_.map(categories, (cat) => (
            <div key={cat} className="labeled-box">
              <div className="labeled-box-label">
                <div className="labeled-box-label-text">
                  <TextMaker text_key={cat} />
                </div>
              </div>
              <div className="labeled-box-content labeled-box-large">
                <ul className="tag-cloud-main">
                  {_.map(tags_by_category[cat], ({ id, active }) => (
                    <li
                      key={id}
                      className={classNames(active && "active")}
                      onClick={() => onSelectTag(id)}
                    >
                      <button role="checkbox" aria-checked={!!active}>
                        <TextMaker text_key={id} />
                      </button>
                      {GlossaryEntry.lookup(id) && (
                        <span className="tag-button-helper" tabIndex="0">
                          <GlossaryIcon
                            id={id}
                            inner_selector={"TablePicker__tooltip-inner"}
                            arrow_selector={"TablePicker__tooltip-arrow"}
                          />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        {_.isEmpty(items) ? (
          <div className="centerer" style={{ minHeight: "300px" }}>
            <p className="large_panel_text">{noItemsMessage}</p>
          </div>
        ) : (
          <div>
            <div className="row item-cloud-row">
              {_.map(items_split, (item_group, group_index) => (
                <div key={group_index} className="col-md-4 item-cloud-col">
                  <TransitionGroup>
                    {_.map(item_group, (item, item_index) => (
                      <CSSTransition
                        key={item_index}
                        classNames="transi-height"
                        timeout={500}
                      >
                        <div>{item}</div>
                      </CSSTransition>
                    ))}
                  </TransitionGroup>
                </div>
              ))}
              <div className="clearfix" />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export { TablePicker };
