import React from "react";

import { GlossaryEntry } from "src/models/glossary.js";

import { trivial_text_maker } from "src/models/text.js";

import { backgroundColor, primaryColor } from "src/core/color_defs.js";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconQuestion } from "src/icons/icons.js";
import { glossary_href } from "src/link_utils.js";

const GlossaryTooltipWrapper = ({ id, children, no_bottom_border }) =>
  is_a11y_mode ? (
    <a
      href={is_a11y_mode ? glossary_href(id) : null}
      title={is_a11y_mode ? trivial_text_maker("glossary_link_title") : null}
    >
      {children}
    </a>
  ) : (
    <span
      className="nowrap glossary-tippy-link"
      style={no_bottom_border && { borderBottom: "none" }}
      tabIndex="0"
      data-ibtt-glossary-key={id}
      data-toggle="tooltip"
    >
      {children}
    </span>
  );

export const GlossaryIcon = ({
  id,
  alternate_text,
  arrow_selector,
  inner_selector,
  icon_color,
  icon_alt_color,
}) => (
  <GlossaryTooltipWrapper no_bottom_border={true} id={id}>
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

export const GlossaryItem = ({ id, alternate_text, item_class }) => (
  <GlossaryTooltipWrapper id={id}>
    <span className={item_class}>
      {alternate_text ? alternate_text : GlossaryEntry.lookup(id).title}
    </span>
  </GlossaryTooltipWrapper>
);
