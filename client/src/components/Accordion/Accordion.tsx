import React from "react";

import { trivial_text_maker } from "src/models/text";

import { IconChevron } from "src/icons/icons";
import { secondaryColor } from "src/style_constants/colors.interop.scss";
import { textLightColor } from "src/style_constants/index";

import { AccordionTransition } from "./AccordionTransition";

import "./Accordion.scss";

const get_accordion_label = (is_expanded: boolean) =>
  trivial_text_maker(is_expanded ? "collapse" : "expand");

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  on_toggle: React.ReactEventHandler<HTMLElement>;
  is_expanded: boolean;
  max_height?: string;
  background_color?: string;
}

export const Accordion = ({
  title,
  is_expanded,
  children,
  on_toggle,
  max_height = "80vh",
  background_color = secondaryColor,
}: AccordionProps) => (
  <div
    aria-label={title}
    className="pull-down-accordion"
    style={{ backgroundColor: background_color, borderColor: background_color }}
  >
    <div className="pull-down-accordion-header">
      <button aria-label={get_accordion_label(is_expanded)} onClick={on_toggle}>
        {title}
      </button>
    </div>

    <AccordionTransition
      is_expanded={is_expanded}
      transition_height={max_height}
    >
      <div
        className="pull-down-accordion-body"
        style={{ paddingTop: "5px", maxHeight: max_height, overflowY: "auto" }}
      >
        {children}
      </div>
    </AccordionTransition>

    <div className="pull-down-accordion-footer">
      <button aria-label={get_accordion_label(is_expanded)} onClick={on_toggle}>
        <div className="pull-down-accordion-expander" aria-hidden={true}>
          <IconChevron
            color={textLightColor}
            rotation={is_expanded ? 180 : undefined}
          />
        </div>
      </button>
    </div>
  </div>
);
