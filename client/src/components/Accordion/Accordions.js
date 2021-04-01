import { easeLinear } from "d3-ease";
import { select } from "d3-selection";
import "d3-transition";
import React from "react";
import ReactDOM from "react-dom";
import { TransitionGroup, Transition } from "react-transition-group";

import { trivial_text_maker } from "src/models/text.js";

import { textLightColor } from "src/core/color_defs.js";

import { IconChevron } from "src/icons/icons.js";

import "./Accordions.scss";

const get_accordion_label = (isExpanded) =>
  ({
    true: trivial_text_maker("collapse"),
    false: trivial_text_maker("expand"),
  }[!!isExpanded]);

function FirstChild(props) {
  const childrenArray = React.Children.toArray(props.children);
  return childrenArray[0] || null;
}

class AccordionEnterExit extends React.Component {
  constructor() {
    super();
  }
  onExiting = (component) => {
    const node = ReactDOM.findDOMNode(component);
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
  onEntering = (component) => {
    const node = ReactDOM.findDOMNode(component);
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
    const {
      expandDuration,
      collapseDuration,
      onExited,
      enter,
      exit,
      in: in_prop,

      className,
      style,
      children,
    } = this.props;

    return (
      <Transition
        {...{
          timeout: { enter: expandDuration, exit: collapseDuration },
          onExited,
          enter,
          exit,
          in: in_prop,
        }}
        onEntering={this.onEntering}
        onExiting={this.onExiting}
      >
        <div className={className} style={style}>
          {children}
        </div>
      </Transition>
    );
  }
}

AccordionEnterExit.defaultProps = {
  max_height: "80vh",
  opening_opacity: 1e-6,
  closing_opacity: 1,
};

const StatelessPullDownAccordion = ({
  max_height,
  title,
  isExpanded,
  children,
  onToggle,
}) => (
  <div aria-label={title} className="pull-down-accordion">
    <div className="pull-down-accordion-header" style={{ display: "flex" }}>
      <button
        aria-label={get_accordion_label(isExpanded)}
        onClick={onToggle}
        style={{ flexGrow: 1, textAlign: "center", paddingRight: "2.5rem" }}
      >
        {title}
      </button>
    </div>
    <TransitionGroup component={FirstChild}>
      {isExpanded && (
        <AccordionEnterExit
          className="pull-down-accordion-body"
          style={{ paddingTop: "5px" }}
          expandDuration={600}
          collapseDuration={600}
          max_height={max_height}
        >
          <div style={{ maxHeight: max_height, overflowY: "auto" }}>
            {children}
          </div>
        </AccordionEnterExit>
      )}
    </TransitionGroup>
    <div className="pull-down-accordion-footer" onClick={onToggle}>
      <div className="pull-down-accordion-expander">
        <IconChevron
          title={get_accordion_label(isExpanded)}
          color={textLightColor}
          rotation={isExpanded && 180}
        />
      </div>
    </div>
  </div>
);

StatelessPullDownAccordion.defaultProps = {
  max_height: "80vh",
};
class AutoAccordion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: props.isInitiallyExpanded,
    };
  }
  render() {
    const { isExpanded } = this.state;
    return React.createElement(StatelessPullDownAccordion, {
      ...this.props,
      isExpanded,
      onToggle: () => this.setState({ isExpanded: !isExpanded }),
    });
  }
}

export {
  FirstChild,
  AccordionEnterExit,
  StatelessPullDownAccordion,
  AutoAccordion,
};
