import classNames from "classnames";
import _ from "lodash";

import React, { Fragment } from "react";
import ReactDOM from "react-dom";

import { useMediaQuery } from "react-responsive";

import {
  run_template,
  trivial_text_maker,
  create_text_maker,
} from "src/models/text";

import { formats } from "src/core/format";

import { maxSmallDevice } from "src/style_constants/index";

import { TextMaker, TM } from "./TextMaker";

// Misc. utility components that don't justify having their own file in ./components, for various reasons

const NoIndex = () =>
  ReactDOM.createPortal(
    <meta name="robots" content="noindex" />,
    document.head
  );

const ExternalLink = ({ children, href, title }) => (
  <a target="_blank" rel="noopener noreferrer" href={href} title={title}>
    {children}
  </a>
);

class Format extends React.PureComponent {
  render() {
    const { type, content, style, className, in_parenthesis, prefix } =
      this.props;

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
        dangerouslySetInnerHTML={{
          __html: formatted_content,
        }}
      />
    );
  }
}

const Year = ({ y }) => run_template(`{{${y}}}`);

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
  responsive = true,
}) => {
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

const LinkStyled = ({ on_click, className, style, children }) => (
  <button
    role="link"
    tabIndex={0}
    onClick={on_click}
    onKeyDown={(e) => e.key === "Enter" && on_click(e)}
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
