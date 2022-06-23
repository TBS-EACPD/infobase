import classNames from "classnames";
import _ from "lodash";
import React from "react";

import "./FancyUL.scss";

type Title = string;

interface FancyULProps {
  className: string;
  title?: Title;
  TitleComponent?: React.ComponentType<{ children?: Title }>;
  children: React.ReactNode[];
}

export const FancyUL = ({
  className,
  title,
  TitleComponent,
  children,
}: FancyULProps) => (
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
