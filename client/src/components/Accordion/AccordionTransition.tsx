import { easeLinear } from "d3-ease";
import { select } from "d3-selection";
import "d3-transition";

import React from "react";
import ReactDOM from "react-dom";
import { TransitionGroup, Transition } from "react-transition-group";

const AccordionTransitionDefaultProps = {
  expand_duration: 600,
  collapse_duration: 600,
  transition_opacity: 1e-6 as string | number,
  transition_height: "80vh" as string | number,
};
type AccordionTransitionProps = typeof AccordionTransitionDefaultProps & {
  is_expanded: boolean;
  children: React.ReactNode;
};

export class AccordionTransition extends React.Component<AccordionTransitionProps> {
  static defaultProps = AccordionTransitionDefaultProps;
  onExiting = (component: HTMLElement) => {
    const node = ReactDOM.findDOMNode(component) as HTMLElement;
    const initialHeight = node.offsetHeight;
    select(node)
      .style("opacity", "1")
      .style("max-height", initialHeight + "px")
      .transition()
      .ease(easeLinear)
      .duration(this.props.collapse_duration)
      .style("opacity", this.props.transition_opacity)
      .style("max-height", "1px");
  };
  onEntering = (component: HTMLElement) => {
    const node = ReactDOM.findDOMNode(component) as HTMLElement;
    select(node)
      .style("max-height", "0px")
      .style("opacity", this.props.transition_opacity)
      .transition()
      .ease(easeLinear)
      .duration(this.props.expand_duration)
      .style("max-height", this.props.transition_height)
      .style("opacity", "1")
      .on("end", function () {
        select(node).style("max-height", "none");
      });
  };
  render() {
    const { is_expanded, expand_duration, collapse_duration, children } =
      this.props;

    return (
      <TransitionGroup>
        {is_expanded && (
          <Transition
            {...{
              timeout: { enter: expand_duration, exit: collapse_duration },
            }}
            onEntering={this.onEntering}
            onExiting={this.onExiting}
          >
            {children}
          </Transition>
        )}
      </TransitionGroup>
    );
  }
}
