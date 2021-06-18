import React from "react";

import "./LabeledBox.scss";

interface LabeledBoxProps {
  label: string | React.ReactNode;
  children: string | React.ReactNode;
}

export class LabeledBox extends React.Component<LabeledBoxProps, never> {
  render() {
    const { label, children } = this.props;

    return (
      <div className="labeled-box">
        <div className="labeled-box-label ">
          <div className="labeled-box-label-text ">{label}</div>
        </div>
        <div className="labeled-box-content">{children}</div>
      </div>
    );
  }
}
