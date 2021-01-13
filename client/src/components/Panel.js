import classNames from "classnames";
import _ from "lodash";
import React from "react";


import { Details } from "./Details.js";
import { FootnoteList } from "./FootnoteList.js";
import { GlossaryItem } from "./glossary_components.js";
import { create_text_maker_component } from "./misc_util_components.js";

import text from "./Panel.yaml";
import "./Panel.scss";

const { text_maker, TM } = create_text_maker_component(text);

const PanelSource = ({ links }) => {
  if (_.isEmpty(links)) {
    return null;
  }
  const last_ix = links.length - 1;
  return (
    <span>
      <span aria-hidden>
        <TM k="panel_source_link_text" />
      </span>
      <span className="sr-only">
        <TM k="panel_a11y_source_expl" />
      </span>
      <ul className="list-unstyled list-inline" style={{ display: "inline" }}>
        {_.map(links, ({ href, html }, ix) => (
          <li key={ix}>
            <a className="source-link" href={href}>
              <span dangerouslySetInnerHTML={{ __html: html }} />
            </a>
            {ix !== last_ix && ", "}
          </li>
        ))}
      </ul>
    </span>
  );
};

const PanelGlossary = ({ keys }) => {
  if (_.isEmpty(keys)) {
    return null;
  }
  const last_ix = keys.length - 1;
  return (
    <span>
      <TM k="panel_glossary_text" />
      <ul className="list-unstyled list-inline" style={{ display: "inline" }}>
        {_.map(keys, (key, ix) => (
          <li key={ix}>
            <GlossaryItem id={key} item_class="glossary-link" />
            {ix !== last_ix && ", "}
          </li>
        ))}
      </ul>
    </span>
  );
};

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
                <span aria-hidden>{isOpen ? "▼" : "►"}</span>
              </button>
            }
            {title && <h2 className="panel-title">{title}</h2>}
            {isOpen && otherHeaderContent}
          </header>
        )}
        {isOpen && (
          <div className="panel-body">
            {children}
            <div className="mrgn-tp-md" />
            {!_.isEmpty(sources) && (
              <div>
                <PanelSource links={sources} />
              </div>
            )}
            {!_.isEmpty(glossary_keys) && (
              <div className="mrgn-tp-md">
                <PanelGlossary keys={glossary_keys} />
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
