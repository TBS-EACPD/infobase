import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text";

interface TextMakerProps {
  text_maker_func?: (key: string, args?: Record<string, unknown>) => string;
  text_key: string;
  el?: string;
  args?: Record<string, unknown>;
  style?: Record<string, unknown>;
  className?: string;
}

const TextMaker = ({
  text_maker_func,
  text_key,
  el,
  args,
  style,
  className,
}: TextMakerProps) => {
  const tm_func = _.isFunction(text_maker_func)
    ? text_maker_func
    : trivial_text_maker;
  const html = tm_func(text_key, _.clone(args)); //must clone args because props are immutable, text-maker will mutate obj
  return React.createElement(el || "span", {
    style,
    className,
    dangerouslySetInnerHTML: { __html: html },
  });
};
export interface TMProps {
  tmf?: (key: string, args?: Record<string, unknown>) => string;
  k: string;
  el?: string;
  args?: Record<string, unknown>;
  style?: Record<string, unknown>;
  className?: string;
}
//shorthand for the above
const TM = (props: TMProps) => (
  <TextMaker
    text_key={props.k}
    el={props.el}
    args={props.args}
    text_maker_func={props.tmf}
    style={props.style}
    className={props.className}
  />
);

export { TextMaker, TM };
