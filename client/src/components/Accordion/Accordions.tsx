import { easeLinear } from "d3-ease";
import { select } from "d3-selection";
import _ from "lodash";
import "d3-transition";
import React from "react";
import ReactDOM from "react-dom";
import { TransitionGroup, Transition } from "react-transition-group";

import { trivial_text_maker } from "src/models/text";

import { IconChevron } from "src/icons/icons";
import { secondaryColor } from "src/style_constants/colors.interop.scss";
import { textLightColor } from "src/style_constants/index";

import "./Accordions.scss";

const get_accordion_label = (isExpanded: boolean) =>
  ({
    true: trivial_text_maker("collapse"),
    false: trivial_text_maker("expand"),
  }[String(!!isExpanded)]);

const AccordionTransitionDefaultProps = {
  max_height: "80vh" as string | number,
  opening_opacity: 1e-6 as string | number,
  closing_opacity: 1 as string | number,
};
type AccordionTransitionProps = typeof AccordionTransitionDefaultProps & {
  isExpanded: boolean;
  expandDuration: number;
  collapseDuration: number;
  onExited?: (node: HTMLElement) => void;
  enter?: boolean;
  exit?: boolean;
  in?: boolean;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
};

class AccordionTransition extends React.Component<AccordionTransitionProps> {
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
    const {
      isExpanded,
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
      <TransitionGroup>
        {isExpanded && (
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
        )}
      </TransitionGroup>
    );
  }
}

interface CommonAccordionProps {
  max_height: string;
  title: string;
  children: React.ReactNode;
  onToggle: React.ReactEventHandler<HTMLElement>;
  background_color: string;
}

const StatelessPullDownAccordion = ({
  max_height = "80vh",
  title,
  isExpanded,
  children,
  onToggle,
  background_color = secondaryColor,
}: CommonAccordionProps & { isExpanded: boolean }) => (
  <div
    aria-label={title}
    className="pull-down-accordion"
    style={{ backgroundColor: background_color, borderColor: background_color }}
  >
    <div className="pull-down-accordion-header" style={{ display: "flex" }}>
      <button
        aria-label={get_accordion_label(isExpanded)}
        onClick={onToggle}
        style={{ flexGrow: 1, textAlign: "center", paddingRight: "2.5rem" }}
      >
        {title}
      </button>
    </div>

    <AccordionTransition
      isExpanded={isExpanded}
      className="pull-down-accordion-body"
      style={{ paddingTop: "5px" }}
      expandDuration={600}
      collapseDuration={600}
      max_height={max_height}
    >
      <div style={{ maxHeight: max_height, overflowY: "auto" }}>{children}</div>
    </AccordionTransition>

    <div
      className="pull-down-accordion-footer"
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) =>
        _.includes(["Enter", " "], event.key) && onToggle(event)
      }
    >
      <div className="pull-down-accordion-expander">
        <IconChevron
          aria_label={get_accordion_label(isExpanded)}
          color={textLightColor}
          rotation={isExpanded ? 180 : undefined}
        />
      </div>
    </div>
  </div>
);

interface AutoAccordionProps extends CommonAccordionProps {
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

export { AccordionTransition, StatelessPullDownAccordion, AutoAccordion };
