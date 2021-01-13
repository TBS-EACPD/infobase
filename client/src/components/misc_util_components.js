import _ from "lodash";
import React, { Fragment } from "react";


import { formats } from "../core/format.js";
import { text_abbrev } from "../general_utils.js";
import {
  run_template,
  trivial_text_maker,
  create_text_maker,
} from "../models/text.js";

import { TextMaker, TM } from "./TextMaker.js";

// Misc. utility components that don't justify having their own file in ./components, for various reasons

const ExternalLink = ({ children, href, title }) => (
  <a target="_blank" rel="noopener noreferrer" href={href} title={title}>
    {children}
  </a>
);

class Format extends React.PureComponent {
  render() {
    const { type, content, style } = this.props;

    return (
      <span
        style={style}
        dangerouslySetInnerHTML={{ __html: formats[type](content) }}
      />
    );
  }
}

const Year = ({ y }) => run_template(`{{${y}}}`);

const TextAbbrev = ({ text, len }) => <div>{text_abbrev(text, len)}</div>;

const TrivialTM = (props) => <TM tmf={trivial_text_maker} {...props} />;
const TrivialTextMaker = (props) => (
  <TextMaker text_maker_func={trivial_text_maker} {...props} />
);
const create_text_maker_component = (text) => {
  const text_maker = create_text_maker(text);
  return { text_maker, TM: (props) => <TM tmf={text_maker} {...props} /> };
};

const DlItem = ({ term, def }) => (
  <Fragment>
    <dt>{term}</dt>
    <dd>{def}</dd>
  </Fragment>
);

const MultiColumnList = ({
  list_items,
  column_count = 2,
  className,
  ul_class,
  li_class,
}) => (
  <div className={className} style={{ display: "flex", flexDirection: "row" }}>
    {_.chain(list_items)
      .chunk(_.ceil(list_items.length / column_count))
      .map((list_chunk, ix) => (
        <ul key={ix} className={ul_class}>
          {_.map(list_chunk, (list_item, ix) => (
            <li key={ix} className={li_class}>
              {list_item}
            </li>
          ))}
        </ul>
      ))
      .value()}
  </div>
);

export {
  Format,
  TrivialTextMaker,
  TrivialTM,
  ExternalLink,
  Year,
  TextAbbrev,
  create_text_maker_component,
  DlItem,
  MultiColumnList,
};
