import {
  declare_single_service_overview_panel,
  declare_single_service_channels_panel,
  declare_single_service_standards_panel,
  declare_single_service_digital_status_panel,
} from "src/panels/panel_declarations/services/index";

export const get_service_panels = () => ({
  intro: [
    declare_single_service_overview_panel(),
    declare_single_service_digital_status_panel(),
    declare_single_service_channels_panel(),
    declare_single_service_standards_panel(),
  ],
});
