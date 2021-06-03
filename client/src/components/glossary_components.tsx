import React from "react";

import { GlossaryEntry } from "src/models/glossary";

import { trivial_text_maker } from "src/models/text";

import { backgroundColor, primaryColor } from "src/core/color_defs";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconQuestion } from "src/icons/icons";
import { glossary_href } from "src/link_utils";

interface GlossaryTooltipWrapperProps {
  id: string;
  children?: React.ReactNode;
  no_bottom_border?: boolean;
}

interface GlossaryIconProps {
  id: string;
  alternate_text?: string;
  arrow_selector?: any;
  inner_selector?: any; // i don't know how to do the types for the selectors
  icon_color?: string;
  icon_alt_color?: string;
}

interface GlossaryItemProps {
  id: string;
  alternate_text: string;
  item_class: string;
}

const GlossaryTooltipWrapper: React.FC<GlossaryTooltipWrapperProps> = ({
  id,
  children,
  no_bottom_border,
}) =>
  is_a11y_mode ? (
    <a
      href={glossary_href(id)}
      title={is_a11y_mode ? trivial_text_maker("glossary_link_title") : null}
    >
      {children}
    </a>
  ) : (
    <span
      className="nowrap glossary-tippy-link"
      style={{ borderBottom: no_bottom_border ? "none" : "initial" }}
      tabIndex={0}
      data-ibtt-glossary-key={id}
      data-toggle="tooltip"
    >
      {children}
    </span>
  );

export const GlossaryIcon: React.FC<GlossaryIconProps> = ({
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

export const GlossaryItem: React.FC<GlossaryItemProps> = ({
  id,
  alternate_text,
  item_class,
}) => (
  <GlossaryTooltipWrapper id={id}>
    <span className={item_class}>
      {alternate_text ? alternate_text : GlossaryEntry.lookup(id).title}
    </span>
  </GlossaryTooltipWrapper>
);
