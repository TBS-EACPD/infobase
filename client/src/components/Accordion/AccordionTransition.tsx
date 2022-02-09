import { easeLinear } from "d3-ease";
import { select } from "d3-selection";
import "d3-transition";

import React from "react";
import ReactDOM from "react-dom";
import { TransitionGroup, Transition } from "react-transition-group";

const AccordionTransitionDefaultProps = {
  max_height: "80vh" as string | number,
  expandDuration: 600,
  collapseDuration: 600,
  opening_opacity: 1e-6,
  closing_opacity: 1 as string | number,
};
type AccordionTransitionProps = typeof AccordionTransitionDefaultProps & {
  isExpanded: boolean;
  children: React.ReactNode;
};

export class AccordionTransition extends React.Component<AccordionTransitionProps> {
  static defaultProps = AccordionTransitionDefaultProps;
  onExiting = (component: HTMLElement) => {
    const node = ReactDOM.findDOMNode(component) as HTMLElement;
    const initialHeight = node.offsetHeight;
    select(node)
      .style("opacity", this.props.closing_opacity)
      .style("max-height", initialHeight + "px")
      .transition()
      .ease(easeLinear)
      .duration(this.props.collapseDuration)
      .style("opacity", this.props.opening_opacity)
      .style("max-height", "1px");
  };
  onEntering = (component: HTMLElement) => {
    const node = ReactDOM.findDOMNode(component) as HTMLElement;
    select(node)
      .style("max-height", "0px")
      .style("opacity", this.props.opening_opacity)
      .transition()
      .ease(easeLinear)
      .duration(this.props.expandDuration)
      .style("max-height", this.props.max_height)
      .style("opacity", "1")
      .on("end", function () {
        select(node).style("max-height", "none");
      });
  };
  render() {
    const { isExpanded, expandDuration, collapseDuration, children } =
      this.props;

    return (
      <TransitionGroup>
        {isExpanded && (
          <Transition
            {...{
              timeout: { enter: expandDuration, exit: collapseDuration },
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
