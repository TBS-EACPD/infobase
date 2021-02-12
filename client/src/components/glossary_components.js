import React from "react";

import Tippy from "@tippyjs/react";

import { backgroundColor, primaryColor } from "src/core/color_defs.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { IconQuestion } from "../icons/icons.js";
import { glossary_href } from "../link_utils.js";
import {
  GlossaryEntry,
  get_glossary_item_tooltip_html,
} from "../models/glossary.js";
import { trivial_text_maker } from "../models/text.js";

const GlossaryTooltipWrapper = ({ id, children }) =>
  is_a11y_mode ? (
    <a
      href={is_a11y_mode ? glossary_href(id) : null}
      title={is_a11y_mode ? trivial_text_maker("glossary_link_title") : null}
    >
      {children}
    </a>
  ) : (
    <Tippy
      content={
        <span
          dangerouslySetInnerHTML={{
            __html: get_glossary_item_tooltip_html(id),
          }}
        />
      }
      interactive
      duration={0}
    >
      <span className="nowrap glossary-tippy-link">{children}</span>
    </Tippy>
  );

export const GlossaryIcon = ({
  id,
  alternate_text,
  arrow_selector,
  inner_selector,
  icon_color,
  icon_alt_color,
}) => (
  <GlossaryTooltipWrapper
    no_bottom_border={true}
    id={id}
    arrow_selector={arrow_selector}
    inner_selector={inner_selector}
  >
    {is_a11y_mode ? (
      alternate_text ? (
        alternate_text
      ) : (
        GlossaryEntry.lookup(id).title
      )
    ) : (
      <IconQuestion
        color={icon_color ? icon_color : backgroundColor}
        width={"1.2em"}
        alternate_color={icon_alt_color ? icon_alt_color : primaryColor}
        svg_style={{ verticalAlign: "-0.3em" }}
      />
    )}
  </GlossaryTooltipWrapper>
);

export const GlossaryItem = ({
  id,
  alternate_text,
  item_class,
  arrow_selector,
  inner_selector,
}) => (
  <GlossaryTooltipWrapper
    id={id}
    arrow_selector={arrow_selector}
    inner_selector={inner_selector}
  >
    <span className={item_class}>
      {alternate_text ? alternate_text : GlossaryEntry.lookup(id).title}
    </span>
  </GlossaryTooltipWrapper>
);
