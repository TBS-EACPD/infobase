import "./FancyUL.scss";

import classNames from "classnames";

export const FancyUL = ({ className, title, children }) => (
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
