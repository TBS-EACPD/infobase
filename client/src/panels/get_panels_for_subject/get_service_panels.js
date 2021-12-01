import {
  declare_single_service_overview_panel,
  ServiceChannels,
  ServiceStandards,
  ServiceDigitalStatus,
} from "src/panels/panel_declarations/services/index";

export const get_service_panels = () => ({
  intro: [
    declare_single_service_overview_panel(),
    //ServiceDigitalStatus
    //ServiceChannels
    //ServiceStandards
  ],
});
