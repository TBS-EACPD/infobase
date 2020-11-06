import _ from "lodash";
import React, { Fragment } from "react";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { create_text_maker_component, BackToTop } from "../components/index.js";
import {
  StandardRouteContainer,
  ScrollToTargetContainer,
} from "../core/NavComponents.js";
import { Table } from "../core/TableClass.js";
import { GlossaryEntry } from "../models/glossary.js";
import { rpb_link } from "../rpb/rpb_link.js";

import { GlossarySearch } from "./GlossarySearch.js";

import glossary_text from "./glossary.yaml";
import "./glossary.scss";

const { text_maker, TM } = create_text_maker_component(glossary_text);

function get_glossary_items_by_letter() {
  const glossary_items = GlossaryEntry.get_all();

  const glossary_items_by_letter = _.chain(glossary_items)
    .groupBy((item) => {
      const first_letter = item.title[0];
      if (_.includes(["É", "È", "Ê", "Ë"], first_letter)) {
        return "E";
      }
      return first_letter;
    })
    .map((items, letter) => {
      const sorted_items = _.sortBy(items, "title");
      return {
        items: sorted_items,
        letter,
      };
    })
    .sortBy("letter")
    .value();
  return glossary_items_by_letter;
}

const tables = Table.get_all();
const table_links_by_tag = _.chain(tables)
  .flatMap("tags")
  .uniq()
  .map((tag) => [
    tag,
    _.chain(tables)
      .filter(({ tags }) => _.includes(tags, tag))
      .map((table) => (
        <li
          key={table.id}
          style={{
            display: "inline-block",
            marginRight: "1em",
          }}
        >
          • <a href={rpb_link({ table })}>{table.name}</a>
        </li>
      ))
      .thru((list_items) => <ul>{list_items}</ul>)
      .value(),
  ])
  .fromPairs()
  .value();

//id tag is there for legacy styles
const Glossary_ = ({ active_key, items_by_letter }) => (
  <div id="#glossary-key">
    <div className="col-sm-12 col-md-8 offset-md-2 font-large">
      {!is_a11y_mode && (
        <div id="glossary_search" className="org_list font-xlarge mrgn-bttm-lg">
          <GlossarySearch />
        </div>
      )}
      <div
        className="glossary-letters mrgn-bttm-xl"
        style={{ textAlign: "center" }}
      >
        <ul
          className="list-inline glossary-letter-list"
          style={{
            display: "inline",
            margin: "0px",
          }}
        >
          {_.map(items_by_letter, ({ letter }) => (
            <li key={letter} style={{ display: "inline" }}>
              <a
                aria-label={`${text_maker(
                  "jump_to_letter_glossary_entries"
                )} ${letter}`}
                href={`#__${letter}`}
                className="glossary-letter-link"
                onClick={(evt) => {
                  evt.preventDefault();
                  const el = document.getElementById(`__${letter}`);
                  el.scrollIntoView({ behavior: "instant" });
                  el.focus();
                }}
              >
                {letter}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="glossary-items">
        <dl>
          {_.map(items_by_letter, ({ letter, items }) =>
            _.map(items, (item, ix) => (
              <Fragment key={ix}>
                <dt
                  className="glossary-dt"
                  id={ix === 0 ? `__${letter}` : null}
                  tabIndex={0}
                >
                  <span id={item.id} tabIndex={-1}>
                    {item.title}
                  </span>
                </dt>
                <dd>
                  <div dangerouslySetInnerHTML={{ __html: item.definition }} />

                  <p>
                    {text_maker("glossary_translation")} {item.translation}
                  </p>

                  {table_links_by_tag[item.id] && (
                    <span>
                      {text_maker("glossary_related_data")}
                      {table_links_by_tag[item.id]}
                    </span>
                  )}

                  <div className="glossary-top-link-container">
                    <a
                      className="glossary-top-link"
                      href="#"
                      tabIndex="0"
                      onClick={(evt) => {
                        evt.preventDefault();
                        document.body.scrollTop = document.documentElement.scrollTop = 0;
                        document.getElementById("app-focus-root").focus();
                      }}
                    >
                      {text_maker("back_to_top")}
                    </a>
                  </div>
                </dd>
              </Fragment>
            ))
          )}
        </dl>
      </div>
    </div>
  </div>
);

export default class Glossary extends React.Component {
  render() {
    const {
      match: {
        params: { active_key },
      },
    } = this.props;

    const items_by_letter = get_glossary_items_by_letter();

    return (
      <StandardRouteContainer
        route_key="glossary-key"
        title={text_maker("glossary")}
        breadcrumbs={[text_maker("glossary")]}
        description={text_maker("glossary_meta_desc")}
      >
        <h1>
          <TM k="glossary" />
        </h1>
        <ScrollToTargetContainer target_id={active_key}>
          {!is_a11y_mode && (
            <BackToTop focus="#glossary_search > div > div > input" />
          )}
          <Glossary_
            active_key={active_key}
            items_by_letter={items_by_letter}
          />
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}
