import classNames from "classnames";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";


import "./FancyUL.scss";

export const FancyUL = ({ className, title, TitleComponent, children }) => (
  <ul className={classNames("fancy-ul", className)} aria-label={title}>
    {title && (
      <li className={"fancy-ul__title"} aria-hidden={true}>
        {TitleComponent ? <TitleComponent>{title}</TitleComponent> : title}
      </li>
    )}
    {_.chain(children)
      .compact()
      .map((item, i) => <li key={i}>{item}</li>)
      .value()}
  </ul>
);

FancyUL.propTypes = {
  title: PropTypes.string,
};
