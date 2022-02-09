import React from "react";

import type { CommonAccordionProps } from "./Accordion";
import { Accordion } from "./Accordion";

interface AccordionAutoProps extends CommonAccordionProps {
  isInitiallyExpanded: boolean;
}
interface AccordionAutoState {
  is_expanded: boolean;
}

export class AccordionAuto extends React.Component<
  AccordionAutoProps,
  AccordionAutoState
> {
  constructor(props: AccordionAutoProps) {
    super(props);
    this.state = {
      is_expanded: props.isInitiallyExpanded,
    };
  }
  render() {
    const { is_expanded } = this.state;
    return React.createElement(Accordion, {
      ...this.props,
      is_expanded,
      onToggle: () => this.setState({ is_expanded: !is_expanded }),
    });
  }
}
