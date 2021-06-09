import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import {
  run_template,
  trivial_text_maker,
  create_text_maker,
} from "src/models/text";

import { formats } from "src/core/format";

import { text_abbrev } from "src/general_utils";

import { TextMaker, TM } from "./TextMaker";

// Misc. utility components that don't justify having their own file in ./components, for various reasons

interface ExternalLinkProps {
  children: Object;
  href: string;
  title: string;
}

interface FormatProps {
  type: number;
  content: string;
  style?: Object;
  className: string;
  in_parenthesis: boolean;
  prefix: boolean;
}

interface YearProps {
  y: number;
}

interface TextAbbrevProps {
  text: string;
  len: number;
}

interface TrivialTMProps {
  tmf?: (key: string, args?: any) => string;
  k: string;
  el?: string;
  args?: Object;
  style?: Object;
  className?: string;
  template_str?: string;
}

interface TrivialTextMakerProps {
  text_maker_func?: (key: string, args?: any) => string;
  text_key: string;
  el?: string;
  args?: Object;
  style?: Object;
  className?: string;
  template_str?: string;
}

interface DlItemProps {
  term: string;
  def: string;
}

interface MultiColumnListProps {
  list_items: Array<String>;
  column_count: number;
  className?: string;
  ul_class?: string;
  li_class?: string;
}

interface LinkStyledProps {
  on_click: (event: any) => any;
  className: string;
  style: Object;
  children: Array<string>;
}

const ExternalLink = (props: ExternalLinkProps) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={props.href}
    title={props.title}
  >
    {props.children}
  </a>
);

class Format extends React.PureComponent<FormatProps> {
  render() {
    const {
      type,
      content,
      style,
      className,
      in_parenthesis,
      prefix,
    } = this.props;

    const formatted_content = _.chain(content)
      .thru(formats[type])
      .thru((content) =>
        prefix ? `<span>${prefix}${content}</span>` : content
      )
      .thru((content) =>
        in_parenthesis ? `<span>(${content})</span>` : content
      )
      .value();

    return (
      <span
        style={style}
        className={className}
        // Apparently dangerouslySetInnerHTML doesn't work for ts
        // dangerouslySetInnerHTML={{
        //   __html: formatted_content,
        // }}
      />
    );
  }
}

const Year = (props: YearProps) => run_template(`{{${props.y}}}`);

const TextAbbrev = (props: TextAbbrevProps) => (
  <div>{text_abbrev(props.text, props.len)}</div>
);

const TrivialTM = (props: TrivialTMProps) => (
  <TM
    tmf={trivial_text_maker}
    k={props.k}
    el={props.el}
    args={props.args}
    style={props.style}
    className={props.className}
    template_str={props.template_str}
  />
);

const TrivialTextMaker = (props: TrivialTextMakerProps) => (
  <TextMaker
    text_maker_func={trivial_text_maker}
    text_key={props.text_key}
    el={props.el}
    args={props.args}
    style={props.style}
    className={props.className}
    template_str={props.template_str}
  />
);
const create_text_maker_component = (text: Object) => {
  const text_maker = create_text_maker(text);
  return {
    text_maker,
    TM: (props: TrivialTMProps) => (
      <TM
        tmf={text_maker}
        k={props.k}
        el={props.el}
        args={props.args}
        style={props.style}
        className={props.className}
        template_str={props.template_str}
      />
    ),
  };
};

const DlItem = (props: DlItemProps) => (
  <Fragment>
    <dt>{props.term}</dt>
    <dd>{props.def}</dd>
  </Fragment>
);

const MultiColumnList = (props: MultiColumnListProps, column_count = 2) => (
  <div
    className={props.className}
    style={{ display: "flex", flexDirection: "row" }}
  >
    {_.chain(props.list_items)
      .chunk(_.ceil(props.list_items.length / column_count))
      .map((list_chunk, ix) => (
        <ul key={ix} className={props.ul_class}>
          {_.map(list_chunk, (list_item, ix) => (
            <li key={ix} className={props.li_class}>
              {list_item}
            </li>
          ))}
        </ul>
      ))
      .value()}
  </div>
);

const LinkStyled = (props: LinkStyledProps) => (
  <a
    role="link"
    tabIndex={0}
    onClick={props.on_click}
    onKeyDown={(e) => e.keyCode === 13 && props.on_click(e)}
    className={classNames("link-styled", props.className)}
    style={props.style}
  >
    {props.children}
  </a>
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
  LinkStyled,
};
