import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";

import { HeightClipper } from "src/components/index";

import { create_text_maker } from "src/models/text";

import { infographic_href_template } from "src/infographic/infographic_href_template";

import {
  HierarchyPeek,
  org_external_hierarchy,
  org_internal_hierarchy,
  program_hierarchy,
  tag_hierarchy,
  crso_hierarchy,
  crso_pi_hierarchy,
} from "./hierarchy_component";

import text from "./hierarchy_panels.yaml";

const text_maker = create_text_maker(text);

export const declare_portfolio_structure_intro_panel = () =>
  declare_panel({
    panel_key: "portfolio_structure_intro",
    subject_types: ["dept"],

    panel_config_func: () => ({
      footnotes: false,
      title: text_maker("portfolio_structure_intro_title"),
      calculate: (subject) => {
        return !_.isEmpty(subject.ministry);
      },

      render({ title, subject }) {
        return (
          <TextPanel title={title}>
            <HeightClipper allowReclip={true} clipHeight={250}>
              <HierarchyPeek
                root={org_external_hierarchy({
                  subject,
                  href_generator: infographic_href_template,
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
    subject_types: ["dept"],

    panel_config_func: () => ({
      footnotes: false,
      title: text_maker("portfolio_structure_related_title"),
      calculate: (subject) => {
        return !_.isEmpty(subject.programs);
      },

      render({ title, subject }) {
        const hierarchy_view = org_internal_hierarchy({
          subject,
          href_generator: infographic_href_template,
          show_dead_sos: true,
        });

        return (
          <TextPanel title={title}>
            <HierarchyPeek root={hierarchy_view} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_program_fed_structure_panel = () =>
  declare_panel({
    panel_key: "program_fed_structure",
    subject_types: ["program"],

    panel_config_func: () => ({
      footnotes: false,
      calculate: _.constant(true),
      title: text_maker("program_fed_structure_title"),
      render({ title, subject }) {
        const hierarchy = program_hierarchy({
          subject,
          href_generator: infographic_href_template,
          show_siblings: false,
          show_cousins: false,
          show_uncles: false,
          show_dead_sos: false,
        });

        return (
          <TextPanel title={title}>
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
    subject_types: ["program"],

    panel_config_func: () => ({
      footnotes: false,
      calculate: _.constant(true),
      title: text_maker("related_program_structure_title"),
      render({ title, subject }) {
        const hierarchy = program_hierarchy({
          subject,
          href_generator: infographic_href_template,
          show_siblings: true,
          show_cousins: true,
          show_uncles: true,
          show_dead_sos: true,
        });

        return (
          <TextPanel title={title}>
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
    subject_types: ["tag"],

    panel_config_func: () => ({
      footnotes: false,
      calculate: _.constant(true),
      title: text_maker("tag_fed_structure_title"),
      render({ title, subject }) {
        const hierarchy_structure = tag_hierarchy({
          subject,
          showSiblings: false,
          showChildren: false,
          href_generator: infographic_href_template,
        });

        return (
          <TextPanel title={title}>
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
    subject_types: ["tag"],

    panel_config_func: () => ({
      footnotes: false,
      calculate: _.constant(true),
      title: text_maker("sibling_tags_title"),
      render({ title, subject }) {
        const hierarchy_structure = tag_hierarchy({
          subject,
          showSiblings: true,
          showChildren: false,
          href_generator: infographic_href_template,
        });

        return (
          <TextPanel title={title}>
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
    subject_types: ["crso"],

    panel_config_func: () => ({
      footnotes: false,
      title: text_maker("crso_in_gov_title"),
      calculate: _.constant(true),

      render({ title, subject }) {
        const hierarchy = crso_pi_hierarchy({
          subject,
          href_generator: infographic_href_template,
        });

        return (
          <TextPanel title={title}>
            <HierarchyPeek root={hierarchy} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_crso_links_to_other_crso_panel = () =>
  declare_panel({
    panel_key: "crso_links_to_other_crso",
    subject_types: ["crso"],

    panel_config_func: () => ({
      footnotes: false,
      calculate: _.constant(true),
      title: text_maker("crso_links_to_other_crso_title"),
      render({ title, subject }) {
        const hierarchy = crso_hierarchy({
          subject,
          href_generator: infographic_href_template,
        });

        return (
          <TextPanel title={title}>
            <HeightClipper clipHeight={250} allowReclip={true}>
              <HierarchyPeek root={hierarchy} />
            </HeightClipper>
          </TextPanel>
        );
      },
    }),
  });
