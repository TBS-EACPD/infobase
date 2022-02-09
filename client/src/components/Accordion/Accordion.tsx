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
  onToggle: React.ReactEventHandler<HTMLElement>;
  background_color: string;
}

const get_accordion_label = (isExpanded: boolean) =>
  ({
    true: trivial_text_maker("collapse"),
    false: trivial_text_maker("expand"),
  }[String(!!isExpanded)]);

export const Accordion = ({
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
      expandDuration={600}
      collapseDuration={600}
      max_height={max_height}
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
