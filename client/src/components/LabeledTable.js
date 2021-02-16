import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

import "./LabeledTable.scss";

export const LabeledTable = ({ title, TitleComponent, contents }) => (
  <section className="labeled-table" aria-label={title}>
    {title && (
      <div className="labeled-table__header" aria-hidden={true}>
        {TitleComponent ? <TitleComponent>{title}</TitleComponent> : title}
      </div>
    )}
    <div className="labeled-table__items">
      {_.map(contents, ({ id, label, content }, ix) => (
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

LabeledTable.propTypes = {
  title: PropTypes.string,
  contents: (props, propName, componentName) => {
    const contents = props[propName];
    const all_labels_are_strings = !_.some(
      contents,
      ({ label }) => !_.isString(label)
    );

    if (!all_labels_are_strings) {
      return new Error(
        `\`${componentName}\`: \`${propName}\` prop's \`label\` values must be strings`
      );
    }
  },
};
