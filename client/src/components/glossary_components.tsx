import React from "react";

import { glossaryEntryStore } from "src/models/glossary";

import { trivial_text_maker } from "src/models/text";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconQuestion } from "src/icons/icons";
import { backgroundColor, primaryColor } from "src/style_constants/index";

interface GlossarySidebarLinkWrapperProps {
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

export const GlossarySidebarLinkWrapper = ({
  id,
  children,
  no_bottom_border,
}: GlossarySidebarLinkWrapperProps) => {
  const glos_item = glossaryEntryStore.lookup(id);

  // DUPLICATION WARNING: this JSX must be manually kept in sync with handlebars helper html
  return (
    <span
      role="button"
      tabIndex={0}
      className="glossary-sidebar-link"
      style={no_bottom_border ? { borderBottom: "none" } : undefined}
      data-ibtt-glossary-key={id}
      data-toggle="glossary_sidebar"
      aria-label={trivial_text_maker("open_glossary_definition", {
        display: glos_item.title,
        title: glos_item.title,
      })}
    >
      {children}
    </span>
  );
};

export const GlossaryIcon = ({
  id,
  alternate_text,
  icon_color,
  icon_alt_color = primaryColor,
}: GlossaryIconProps) => (
  <GlossarySidebarLinkWrapper no_bottom_border={true} id={id}>
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
  </GlossarySidebarLinkWrapper>
);

export const GlossaryItem = ({
  id,
  alternate_text,
  item_class,
}: GlossaryItemProps) => (
  <GlossarySidebarLinkWrapper id={id}>
    <span className={item_class}>
      {alternate_text ? alternate_text : glossaryEntryStore.lookup(id).title}
    </span>
  </GlossarySidebarLinkWrapper>
);
