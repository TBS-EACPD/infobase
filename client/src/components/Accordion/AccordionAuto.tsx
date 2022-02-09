import React from "react";

import type { ComponentProps, SafeOmit } from "src/types/util_types";

import { Accordion } from "./Accordion";

type AccordionAutoProps = {
  is_initially_expanded?: boolean;
} & SafeOmit<
  SafeOmit<ComponentProps<typeof Accordion>, "is_expanded">,
  "on_toggle"
>;
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
      is_expanded: props.is_initially_expanded || false,
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
