import React from "react";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { TooltipActivator } from "./TooltipActivator";
import { TooltipModalDelegator } from "./TooltipModalDelegator";

export class TooltipManager extends React.Component {
  render() {
    return is_a11y_mode ? (
      <TooltipModalDelegator>{this.props.children}</TooltipModalDelegator>
    ) : (
      <TooltipActivator>{this.props.children}</TooltipActivator>
    );
  }
}
