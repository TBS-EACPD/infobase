import { trivial_text_maker } from "../models/text.js";

// I think eslint is wrong here
/* disable-eslint react/jsx-no-danger-children */
const TextMaker = ({
  text_maker_func,
  text_key,
  el,
  args,
  style,
  className,
  template_str,
}) => {
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
interface TMProps {
  k: string;
  el?: string;
  args?: any;
  tmf?: any;
  style?: any;
  className?: string;
  template_str?: any;
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
    template_str={props.template_str}
  />
);

export { TextMaker, TM };
