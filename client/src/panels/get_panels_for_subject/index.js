import _ from "lodash";

import { PanelRegistry } from "src/panels/PanelRegistry";

import { is_dev } from "src/core/injected_build_constants";

const panel_loading_promises = (subject) => {
  switch (subject.subject_type) {
    case "gov":
      return import("./get_gov_panels").then(({ get_gov_panels }) =>
        get_gov_panels(subject)
      );
    case "dept":
      return import("./get_dept_panels").then(({ get_dept_panels }) =>
        get_dept_panels(subject)
      );
    case "crso":
      return import("./get_crso_panels").then(({ get_crso_panels }) =>
        get_crso_panels(subject)
      );
    case "tag":
      return import("./get_tag_panels").then(({ get_tag_panels }) =>
        get_tag_panels(subject)
      );
    case "program":
      return import("./get_program_panels").then(({ get_program_panels }) =>
        get_program_panels(subject)
      );
    case "service":
      return import("./get_service_panels").then(({ get_service_panels }) =>
        get_service_panels(subject)
      );
  }
};

export function get_panels_for_subject(subject) {
  return panel_loading_promises(subject).then((panel_keys) =>
    _.chain(panel_keys)
      .map((panel_keys_for_area, area_id) => [
        area_id,
        _.chain(panel_keys_for_area)
          .compact() //the above functions create null elements to ease using conditionals, filter them out.
          .map((key) => {
            const panel_obj = PanelRegistry.lookup(key, subject.subject_type);

            if (!panel_obj && is_dev) {
              throw new Error(`${key} is not a valid panel`);
            }

            return panel_obj && key;
          })
          .value(),
      ])
      .fromPairs()
      .pickBy((obj) => !_.isEmpty(obj)) //filter out empty bubbles
      .value()
  );
}
