import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { Details } from "src/components/Details/Details";
import { FootnoteList } from "src/components/FootnoteList/FootnoteList";
import { GlossaryItem } from "src/components/glossary_components";
import { create_text_maker_component } from "src/components/misc_util_components";

import { get_source_links } from "src/DatasetsRoute/utils";

import { textLightColor } from "src/style_constants/index";

import text from "./Panel.yaml";
import "./Panel.scss";

const { text_maker, TM } = create_text_maker_component(text);

const InlineCommaList = ({ items }) => (
  <ul className="list-unstyled list-inline" style={{ display: "inline" }}>
    {_.map(items, (item, ix) => (
      <li key={ix} className="list-inline-item">
        {item}
        {ix !== items.length - 1 && ", "}
      </li>
    ))}
  </ul>
);

export class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }
  render() {
    const { isOpen } = this.state;
    const {
      allowOverflow,
      title,
      otherHeaderContent,
      children,
      sources,
      datasets,
      glossary_keys,
      footnotes,
    } = this.props;

    return (
      <section
        className={classNames(
          "panel panel-info mrgn-bttm-md",
          allowOverflow && "panel-overflow"
        )}
      >
        {(title || otherHeaderContent) && (
          <header className="panel-heading">
            {
              <button
                className={classNames("panel-heading-utils")}
                onClick={() => this.setState({ isOpen: !isOpen })}
                aria-label={
                  isOpen
                    ? text_maker("collapse_panel")
                    : text_maker("expand_panel")
                }
              >
                <span style={{ color: textLightColor }} aria-hidden>
                  {isOpen ? "▼" : "►"}
                </span>
              </button>
            }
            {title && <h2 className="panel-title">{title}</h2>}
            {isOpen && otherHeaderContent}
          </header>
        )}
        {isOpen && (
          <div className="panel-body">
            {children}
            {!_.isEmpty(glossary_keys) && (
              <div className="mrgn-tp-md">
                <TM k="panel_additional_terms" />
                <TM k="panel_inline_colon" />
                <InlineCommaList
                  items={_.map(glossary_keys, (key) => (
                    <GlossaryItem id={key} item_class="bold" />
                  ))}
                />
              </div>
            )}
            {!_.isEmpty(sources) && (
              <div className="mrgn-tp-md">
                <TM k="sources" />
                <TM k="panel_inline_colon" />
                <InlineCommaList
                  items={_.chain(sources)
                    .map("key")
                    .thru(get_source_links)
                    .map(({ href, html }, ix) => (
                      <a key={ix} className="bold" href={href}>
                        <span dangerouslySetInnerHTML={{ __html: html }} />
                      </a>
                    ))
                    .value()}
                />
              </div>
            )}
            {!_.isEmpty(datasets) && (
              <div className="mrgn-tp-md">
                <TM k="datasets" />
                <TM k="panel_inline_colon" />
                <InlineCommaList
                  items={_.map(datasets, ({ name, infobase_link }) => (
                    <a className="bold" href={infobase_link}>
                      <span dangerouslySetInnerHTML={{ __html: name }} />
                    </a>
                  ))}
                />
              </div>
            )}
            {!_.isEmpty(footnotes) && (
              <div className="mrgn-tp-md">
                <Details
                  summary_content={<TM k="footnotes" />}
                  content={<FootnoteList footnotes={footnotes} />}
                />
              </div>
            )}
          </div>
        )}
      </section>
    );
  }
}
