import _ from "lodash";

import React from "react";

import { trivial_text_maker } from "src/models/text";

import { IconChevron } from "src/icons/icons";
import { secondaryColor } from "src/style_constants/colors.interop.scss";
import { textLightColor } from "src/style_constants/index";

import { AccordionTransition } from "./AccordionTransition";

import "./Accordion.scss";

export interface CommonAccordionProps {
  max_height: string;
  title: string;
  children: React.ReactNode;
  background_color: string;
}

const get_accordion_label = (is_expanded: boolean) =>
  trivial_text_maker(is_expanded ? "collapse" : "expand");

export const Accordion = ({
  max_height = "80vh",
  title,
  is_expanded,
  children,
  on_toggle,
  background_color = secondaryColor,
}: CommonAccordionProps & {
  on_toggle: React.ReactEventHandler<HTMLElement>;
  is_expanded: boolean;
}) => (
  <div
    aria-label={title}
    className="pull-down-accordion"
    style={{ backgroundColor: background_color, borderColor: background_color }}
  >
    <div className="pull-down-accordion-header" style={{ display: "flex" }}>
      <button
        aria-label={get_accordion_label(is_expanded)}
        onClick={on_toggle}
        style={{ flexGrow: 1, textAlign: "center", paddingRight: "2.5rem" }}
      >
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

    <div
      className="pull-down-accordion-footer"
      role="button"
      tabIndex={0}
      onClick={on_toggle}
      onKeyDown={(event) =>
        _.includes(["Enter", " "], event.key) && on_toggle(event)
      }
    >
      <div className="pull-down-accordion-expander">
        <IconChevron
          aria_label={get_accordion_label(is_expanded)}
          color={textLightColor}
          rotation={is_expanded ? 180 : undefined}
        />
      </div>
    </div>
  </div>
);
