import "./FancyUL.scss";

import classNames from "classnames";

export const FancyUL = ({ className, title, children }) => {
  if (!_.isString(title)) {
    throw new Error(
      "FancyUL title prop must be a string, for use in its aria-label attribute."
    );
  }

  return (
    <ul className={classNames("fancy-ul", className)} aria-label={title}>
      {title && (
        <li className={"fancy-ul__title"} aria-hidden={true}>
          {title}
        </li>
      )}
      {_.chain(children)
        .compact()
        .map((item, i) => <li key={i}>{item}</li>)
        .value()}
    </ul>
  );
};
