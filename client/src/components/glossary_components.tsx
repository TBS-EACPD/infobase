import React from "react";

import { glossaryEntryStore } from "src/models/glossary";

import { trivial_text_maker } from "src/models/text";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconQuestion } from "src/icons/icons";
import { glossary_href } from "src/link_utils";
import { backgroundColor, primaryColor } from "src/style_constants/index";

interface GlossaryTooltipWrapperProps {
  id: string;
  children?: React.ReactNode;
  no_bottom_border?: boolean;
}

interface GlossaryIconProps {
  id: string;
  alternate_text?: string;
  icon_color?: string;
  icon_alt_color?: string | false;
}

interface GlossaryItemProps {
  id: string;
  alternate_text?: string;
  item_class: string;
}

export const GlossaryTooltipWrapper = ({
  id,
  children,
  no_bottom_border,
}: GlossaryTooltipWrapperProps) => {
  const glos_item = glossaryEntryStore.lookup(id);
  return is_a11y_mode ? (
    <a
      href={glossary_href(id)}
      title={trivial_text_maker("glossary_link_title")}
    >
      {children}
    </a>
  ) : (
    <button
      className="nowrap glossary-sidebar-link"
      style={no_bottom_border ? { borderBottom: "none" } : undefined}
      data-ibtt-glossary-key={id}
      data-toggle="glossary_sidebar"
      aria-label={trivial_text_maker("open_glossary_definition", {
        display: glos_item.title,
        title: glos_item.title,
      })}
    >
      {children}
    </button>
  );
};

export const GlossaryIcon = ({
  id,
  alternate_text,
  icon_color,
  icon_alt_color = primaryColor,
}: GlossaryIconProps) => (
  <GlossaryTooltipWrapper no_bottom_border={true} id={id}>
    {is_a11y_mode ? (
      alternate_text ? (
        alternate_text
      ) : (
        glossaryEntryStore.lookup(id).title
      )
    ) : (
      <IconQuestion
        color={icon_color ? icon_color : backgroundColor}
        width={"1.2em"}
        alternate_color={icon_alt_color}
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
      {alternate_text ? alternate_text : glossaryEntryStore.lookup(id).title}
    </span>
  </GlossaryTooltipWrapper>
);
