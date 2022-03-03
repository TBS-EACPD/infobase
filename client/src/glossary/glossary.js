import _ from "lodash";
import React, { Fragment } from "react";

import {
  create_text_maker_component,
  FloatingButton,
} from "src/components/index";

import { is_a11y_mode } from "src/core/injected_build_constants";

import {
  StandardRouteContainer,
  ScrollToTargetContainer,
  scroll_into_view_and_focus,
  scroll_to_top,
} from "src/core/NavComponents";

import { rpb_link } from "src/rpb/rpb_link";
import { Table } from "src/tables/TableClass";

import { get_glossary_items_by_letter } from "./glossary_utils";

import { GlossarySearch } from "./GlossarySearch";

import glossary_text from "./glossary.yaml";
import "./glossary.scss";

const { text_maker, TM } = create_text_maker_component(glossary_text);

const tables = Table.store.get_all();
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
const Glossary_ = ({ items_by_letter }) => (
  <div id="#glossary-key">
    <div className="col-md-12 col-12 col-lg-8 offset-lg-2 font-large">
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
          className="list-inline d-flex flex-wrap justify-content-center"
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

                  scroll_into_view_and_focus(el, { behavior: "instant" });
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
                >
                  <span id={item.id}>{item.title}</span>
                </dt>
                <dd>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: item.get_compiled_definition(),
                    }}
                  />

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
                      href="#glossary"
                      onClick={(evt) => {
                        evt.preventDefault();
                        scroll_to_top();
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
            <FloatingButton
              button_text={text_maker("back_to_top")}
              showWithScroll={true}
              handleClick={() => scroll_to_top()}
              tabIndex={-1}
            />
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
