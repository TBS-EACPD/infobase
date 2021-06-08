import { easeLinear } from "d3-ease";
import { select } from "d3-selection";
import "d3-transition";
import React from "react";
import ReactDOM from "react-dom";
import { TransitionGroup, Transition } from "react-transition-group";

import { trivial_text_maker } from "src/models/text";

import { textLightColor } from "src/core/color_defs";

import { IconChevron } from "src/icons/icons";

import "./Accordions.scss";

const get_accordion_label = (isExpanded: boolean) =>
  ({
    true: trivial_text_maker("collapse"),
    false: trivial_text_maker("expand"),
  }[String(!!isExpanded)]);

function FirstChild(props: { children: React.ReactElement }) {
  const childrenArray = React.Children.toArray(props.children);
  return childrenArray[0] || null;
}

interface AccordionEnterExitProps {
  opening_opacity?: number;
  closing_opacity?: number;
  expandDuration: number;
  collapseDuration: number;
  max_height: number | string;
  onExited?: (node: HTMLElement) => void;
  enter?: boolean;
  exit?: boolean;
  in?: boolean;
  className: string;
  style: { [key: string]: string };
  children: React.ReactElement;
}
class AccordionEnterExit extends React.Component<AccordionEnterExitProps> {
  defaultProps = {
    max_height: "80vh",
    opening_opacity: 1e-6,
    closing_opacity: 1,
  };
  onExiting = (component: HTMLElement) => {
    const node = ReactDOM.findDOMNode(component) as HTMLElement;
    const initialHeight = node.offsetHeight;
    select(node)
      .style("opacity", this.props.closing_opacity!)
      .style("max-height", initialHeight + "px")
      .transition()
      .ease(easeLinear)
      .duration(this.props.collapseDuration)
      .style("opacity", this.props.opening_opacity!)
      .style("max-height", "1px");
  };
  onEntering = (component: HTMLElement) => {
    const node = ReactDOM.findDOMNode(component) as HTMLElement;
    select(node)
      .style("max-height", "0px")
      .style("opacity", this.props.opening_opacity!)
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

interface CommonStatelessPullDownAccordionProps {
  max_height: number | string;
  title: string;
  children: React.ReactElement;
  onToggle: React.ReactEventHandler<HTMLElement>;
}
interface StatelessPullDownAccordionProps
  extends CommonStatelessPullDownAccordionProps {
  isExpanded: boolean;
}

const StatelessPullDownAccordion = ({
  max_height,
  title,
  isExpanded,
  children,
  onToggle,
}: StatelessPullDownAccordionProps) => (
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
      {isExpanded ? (
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
      ) : undefined}
    </TransitionGroup>
    <div className="pull-down-accordion-footer" onClick={onToggle}>
      <div className="pull-down-accordion-expander">
        <IconChevron
          title={get_accordion_label(isExpanded)}
          color={textLightColor}
          rotation={isExpanded ? 180 : undefined}
        />
      </div>
    </div>
  </div>
);

StatelessPullDownAccordion.defaultProps = {
  max_height: "80vh",
};
interface AutoAccordionProps extends CommonStatelessPullDownAccordionProps {
  isInitiallyExpanded: boolean;
}
interface AutoAccordionState {
  isExpanded: boolean;
}

class AutoAccordion extends React.Component<
  AutoAccordionProps,
  AutoAccordionState
> {
  constructor(props: AutoAccordionProps) {
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
