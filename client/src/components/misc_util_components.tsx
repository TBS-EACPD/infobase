import classNames from "classnames";
import _ from "lodash";

import React, { Fragment, ReactChild } from "react";
import ReactDOM from "react-dom";

import { useMediaQuery } from "react-responsive";

import {
  run_template,
  trivial_text_maker,
  create_text_maker,
} from "src/models/text";

import { FormatKey, formats } from "src/core/format";

import { maxSmallDevice } from "src/style_constants/index";

import { TextMaker, TM, TMProps, } from "./TextMaker";

// Misc. utility components that don't justify having their own file in ./components, for various reasons

interface FormatProps {
  type: any;
  content: any;
  style?: React.CSSProperties;
  className?: string;
  in_parenthesis?: boolean;
  prefix?: string;
}

const NoIndex = () =>
  ReactDOM.createPortal(
    <meta name="robots" content="noindex" />,
    document.head
  );

const ExternalLink = ({ children, href, title }: {children: React.ReactNode,href: string, title: string}) => (
  <a target="_blank" rel="noopener noreferrer" href={href} title={title}>
    {children}
  </a>
);

class Format extends React.PureComponent<FormatProps> {
  render() {
    const { type, content, style, className, in_parenthesis, prefix } =
      this.props;

    const formatted_content = _.chain(content)
      .thru(formats[type as FormatKey])
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
        dangerouslySetInnerHTML={{
          __html: formatted_content as string,
        }}
      />
    );
  }
}

const Year = ({ y }: {y: number}) => run_template(`{{${y}}}`);

const TrivialTM = (props: JSX.IntrinsicAttributes & TMProps) => <TM tmf={trivial_text_maker} {...props} />;
const TrivialTextMaker = (props: any) => (
  <TextMaker text_maker_func={trivial_text_maker} {...props} />
);
const create_text_maker_component = (text: TextBundle) => {
  const text_maker = create_text_maker(text);
  return { text_maker, TM: (props: JSX.IntrinsicAttributes & TMProps) => <TM tmf={text_maker} {...props} /> };
};

const DlItem = ({ term, def }: {term: object,def:object}) => (
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
  responsive = true,
}: {list_items: any[], column_count: number, className: string, ul_class: string,li_class:string,responsive: boolean}) => {
  const is_small_screen = useMediaQuery({
    query: `(max-width: ${maxSmallDevice})`,
  });
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "row" }}
    >
      {_.chain(list_items)
        .thru((list_items) => {
          if (responsive && is_small_screen) {
            return [list_items];
          } else {
            const column_length = _.ceil(list_items.length / column_count);
            return _.chunk(list_items, column_length);
          }
        })
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
};

const LinkStyled = ({ on_click, className, style, children }: {on_click: React.MouseEventHandler<HTMLButtonElement>,className:string,style:React.CSSProperties,children: React.ReactNode}) => (
  <button
    role="link"
    tabIndex={0}
    onClick={on_click}
    onKeyDown={(e) => e.key === "Enter" && on_click((e as unknown as React.MouseEvent<HTMLButtonElement>)) }
    className={classNames("link-styled", "button-unstyled", className)}
    style={style}
  >
    {children}
  </button>
);

export {
  NoIndex,
  Format,
  TrivialTextMaker,
  TrivialTM,
  ExternalLink,
  Year,
  create_text_maker_component,
  DlItem,
  MultiColumnList,
  LinkStyled,
};

