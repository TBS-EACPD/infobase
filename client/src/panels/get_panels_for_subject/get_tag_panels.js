import {
  // tag only panels
  declare_m2m_tag_warning_panel,
  declare_tag_fed_structure_panel,
  declare_sibling_tags_panel,
  declare_tag_progs_by_dept_panel,
  declare_related_tags_panel,
  declare_description_panel,
  declare_tagging_key_concepts_panel,
  declare_resource_structure_panel,
} from "src/panels/panel_declarations/index";

export const get_tag_panels = () => ({
  intro: [
    declare_tagging_key_concepts_panel(),
    declare_description_panel(),
    declare_tag_fed_structure_panel(),
    declare_tag_progs_by_dept_panel(),
  ],
  structure: [
    declare_m2m_tag_warning_panel(),
    declare_resource_structure_panel(),
  ],
  related: [declare_related_tags_panel(), declare_sibling_tags_panel()],
});
