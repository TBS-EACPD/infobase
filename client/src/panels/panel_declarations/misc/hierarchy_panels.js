import _ from "lodash";
import React from "react";

import {
  util_components,
  TextPanel,
  infograph_href_template,
  create_text_maker,
  declare_panel,
} from "../shared.js";

import {
  HierarchyPeek,
  org_external_hierarchy,
  org_internal_hierarchy,
  program_hierarchy,
  tag_hierarchy,
  crso_hierarchy,
  crso_pi_hierarchy,
} from "./hierarchy_component.js";

import text from "./hierarchy_panels.yaml";

const text_maker = create_text_maker(text);
const { HeightClipper } = util_components;

export const declare_portfolio_structure_intro_panel = () =>
  declare_panel({
    panel_key: "portfolio_structure_intro",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      calculate(subject) {
        return !_.isEmpty(subject.ministry);
      },

      render({ calculations }) {
        const { subject } = calculations;

        return (
          <TextPanel title={text_maker("portfolio_structure_intro_title")}>
            <HeightClipper allowReclip={true} clipHeight={250}>
              <HierarchyPeek
                root={org_external_hierarchy({
                  subject,
                  href_generator: infograph_href_template,
                })}
              />
            </HeightClipper>
          </TextPanel>
        );
      },
    }),
  });

export const declare_portfolio_structure_related_panel = () =>
  declare_panel({
    panel_key: "portfolio_structure_related",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      calculate(subject) {
        return !_.isEmpty(subject.programs);
      },

      render({ calculations }) {
        const { subject } = calculations;

        const hierarchy_view = org_internal_hierarchy({
          subject,
          href_generator: infograph_href_template,
          show_dead_sos: true,
        });

        return (
          <TextPanel title={text_maker("portfolio_structure_related_title")}>
            <HierarchyPeek root={hierarchy_view} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_program_fed_structure_panel = () =>
  declare_panel({
    panel_key: "program_fed_structure",
    levels: ["program"],
    panel_config_func: (level, panel_key) => ({
      calculate: _.constant(true),
      render({ calculations }) {
        const { subject } = calculations;

        const hierarchy = program_hierarchy({
          subject,
          label_crsos: true,
          href_generator: infograph_href_template,
          show_siblings: false,
          show_cousins: false,
          show_uncles: false,
          show_dead_sos: false,
        });

        return (
          <TextPanel title={text_maker("program_fed_structure_title")}>
            <HeightClipper clipHeight={250} allowReclip={true}>
              <HierarchyPeek root={hierarchy} />
            </HeightClipper>
          </TextPanel>
        );
      },
    }),
  });

export const declare_related_program_structure_panel = () =>
  declare_panel({
    panel_key: "related_program_structure",
    levels: ["program"],
    panel_config_func: (level, panel_key) => ({
      calculate: _.constant(true),

      render({ calculations }) {
        const { subject } = calculations;

        const hierarchy = program_hierarchy({
          subject,
          label_crsos: true,
          href_generator: infograph_href_template,
          show_siblings: true,
          show_cousins: true,
          show_uncles: true,
          show_dead_sos: true,
        });

        return (
          <TextPanel title={text_maker("related_program_structure_title")}>
            <HeightClipper clipHeight={250} allowReclip={true}>
              <HierarchyPeek root={hierarchy} />
            </HeightClipper>
          </TextPanel>
        );
      },
    }),
  });

export const declare_tag_fed_structure_panel = () =>
  declare_panel({
    panel_key: "tag_fed_structure",
    levels: ["tag"],
    panel_config_func: (level, panel_key) => ({
      calculate: _.constant(true),

      render({ calculations }) {
        const { subject } = calculations;

        const hierarchy_structure = tag_hierarchy({
          subject,
          showSiblings: false,
          showChildren: false,
          href_generator: infograph_href_template,
        });

        return (
          <TextPanel title={text_maker("tag_fed_structure_title")}>
            <HeightClipper clipHeight={250} allowReclip={true}>
              <HierarchyPeek root={hierarchy_structure} />
            </HeightClipper>
          </TextPanel>
        );
      },
    }),
  });

export const declare_sibling_tags_panel = () =>
  declare_panel({
    panel_key: "sibling_tags",
    levels: ["tag"],
    panel_config_func: (level, panel_key) => ({
      calculate: _.constant(true),

      render({ calculations }) {
        const { subject } = calculations;

        const hierarchy_structure = tag_hierarchy({
          subject,
          showSiblings: true,
          showChildren: false,
          href_generator: infograph_href_template,
        });

        return (
          <TextPanel title={text_maker("sibling_tags_title")}>
            <HeightClipper clipHeight={350} allowReclip={true}>
              <HierarchyPeek root={hierarchy_structure} />
            </HeightClipper>
          </TextPanel>
        );
      },
    }),
  });

export const declare_crso_in_gov_panel = () =>
  declare_panel({
    panel_key: "crso_in_gov",
    levels: ["crso"],
    panel_config_func: (level, panel_key) => ({
      calculate: _.constant(true),

      render({ calculations }) {
        const { subject } = calculations;

        const hierarchy = crso_pi_hierarchy({
          subject,
          label_crsos: true,
          href_generator: infograph_href_template,
        });

        return (
          <TextPanel title={text_maker("crso_in_gov_title")}>
            <HierarchyPeek root={hierarchy} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_crso_links_to_other_crso_panel = () =>
  declare_panel({
    panel_key: "crso_links_to_other_crso",
    levels: ["crso"],
    panel_config_func: (level, panel_key) => ({
      calculate: _.constant(true),

      render({ calculations }) {
        const { subject } = calculations;

        const hierarchy = crso_hierarchy({
          subject,
          label_crsos: true,
          href_generator: infograph_href_template,
        });

        return (
          <TextPanel title={text_maker("crso_links_to_other_crso_title")}>
            <HeightClipper clipHeight={250} allowReclip={true}>
              <HierarchyPeek root={hierarchy} />
            </HeightClipper>
          </TextPanel>
        );
      },
    }),
  });
