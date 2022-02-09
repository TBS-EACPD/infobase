import React from "react";

import type { CommonAccordionProps } from "./Accordion";
import { Accordion } from "./Accordion";

interface AccordionAutoProps extends CommonAccordionProps {
  isInitiallyExpanded: boolean;
}
interface AccordionAutoState {
  isExpanded: boolean;
}

export class AccordionAuto extends React.Component<
  AccordionAutoProps,
  AccordionAutoState
> {
  constructor(props: AccordionAutoProps) {
    super(props);
    this.state = {
      isExpanded: props.isInitiallyExpanded,
    };
  }
  render() {
    const { isExpanded } = this.state;
    return React.createElement(Accordion, {
      ...this.props,
      isExpanded,
      onToggle: () => this.setState({ isExpanded: !isExpanded }),
    });
  }
}
