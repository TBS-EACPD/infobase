import "./FancyUL.scss";

import classNames from "classnames";

export const FancyUL = ({ children, ul_class }) => (
  <ul className={classNames("fancy-ul", ul_class)}>
    {_.chain(children)
      .compact()
      .map((item, i) => <li key={i}>{item}</li>)
      .value()}
  </ul>
);
