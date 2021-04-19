import _ from "lodash";
import React from "react";

import "./LabeledTable.scss";

interface ContentItem {
  id?: string;
  label: string;
  content: React.ReactNode;
}
interface LabeledTableProps {
  title: string;
  contents: Array<ContentItem>;
  TitleComponent?: any;
}

export const LabeledTable = (props: LabeledTableProps) => (
  <section className="labeled-table" aria-label={props.title}>
    <div className="labeled-table__header" aria-hidden={true}>
      {props.TitleComponent ? (
        <props.TitleComponent>{props.title}</props.TitleComponent>
      ) : (
        props.title
      )}
    </div>
    <div className="labeled-table__items">
      {_.map(props.contents, ({ id, label, content }, ix) => (
        <div
          className="labeled-table__item"
          key={id || ix}
          id={id}
          tabIndex={0}
          aria-label={label}
        >
          <div className="labeled-table__item-label" aria-hidden={true}>
            {label}
          </div>
          <div className="labeled-table__item-description">{content}</div>
        </div>
      ))}
    </div>
  </section>
);
