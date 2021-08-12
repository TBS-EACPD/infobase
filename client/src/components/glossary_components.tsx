import React from "react";

import { GlossaryEntry } from "src/models/glossary";

import { trivial_text_maker } from "src/models/text";

import { is_a11y_mode } from "src/core/injected_build_constants";

import style_variables from "src/common_style_variables/common-variables.module.scss";

import { IconQuestion } from "src/icons/icons";
import { glossary_href } from "src/link_utils";

const { backgroundColor, primaryColor } = style_variables;

interface GlossaryTooltipWrapperProps {
  id: string;
  children?: React.ReactNode;
  no_bottom_border?: boolean;
}

interface GlossaryIconProps {
  id: string;
  alternate_text?: string;
  icon_color?: string;
  icon_alt_color?: string;
}

interface GlossaryItemProps {
  id: string;
  alternate_text?: string;
  item_class: string;
}

const GlossaryTooltipWrapper = ({
  id,
  children,
  no_bottom_border,
}: GlossaryTooltipWrapperProps) =>
  is_a11y_mode ? (
    <a
      href={glossary_href(id)}
      title={trivial_text_maker("glossary_link_title")}
    >
      {children}
    </a>
  ) : (
    <span
      className="nowrap glossary-tippy-link"
      style={no_bottom_border ? { borderBottom: "none" } : undefined}
      tabIndex={0}
      data-ibtt-glossary-key={id}
      data-toggle="tooltip"
    >
      {children}
    </span>
  );

export const GlossaryIcon = ({
  id,
  alternate_text,
  icon_color,
  icon_alt_color,
}: GlossaryIconProps) => (
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

export const GlossaryItem = ({
  id,
  alternate_text,
  item_class,
}: GlossaryItemProps) => (
  <GlossaryTooltipWrapper id={id}>
    <span className={item_class}>
      {alternate_text ? alternate_text : GlossaryEntry.lookup(id).title}
    </span>
  </GlossaryTooltipWrapper>
);
