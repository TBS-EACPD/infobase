import React from "react";

import type { CommonAccordionProps } from "./Accordion";
import { Accordion } from "./Accordion";

interface AccordionAutoProps extends CommonAccordionProps {
  is_initially_expanded: boolean;
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
      is_expanded: props.is_initially_expanded,
    };
  }
  render() {
    const { is_expanded } = this.state;
    return (
      <Accordion
        {...this.props}
        is_expanded={is_expanded}
        on_toggle={() => this.setState({ is_expanded: !is_expanded })}
      />
    );
  }
}
