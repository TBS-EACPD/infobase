import { PanelRegistry } from "src/panels/PanelRegistry";

import { is_dev } from "src/core/injected_build_constants";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link";
import { Table } from "src/tables/TableClass";

const declare_panel = ({ panel_key, subject_types, panel_config_func }) => {
  subject_types.forEach((subject_type) => {
    if (
      !PanelRegistry.is_registered_key_for_subject_type(panel_key, subject_type)
    ) {
      new PanelRegistry({
        subject_type,
        key: panel_key,
        ...panel_config_func(subject_type, panel_key),
      });
    } else if (is_dev) {
      console.warn(
        `Panel with ${panel_key} is already registered for subject type ${subject_type}`
      );
    }
  });

  return panel_key;
};

const get_planned_spending_source_link = (subject) => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.store.lookup("programSpending");
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: "details",
      columns: ["{{planning_year_1}}"],
    }),
  };
};
const get_planned_fte_source_link = (subject) => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.store.lookup("programFtes");
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: "details",
      columns: ["{{planning_year_1}}"],
    }),
  };
};

export {
  declare_panel,
  get_planned_spending_source_link,
  get_planned_fte_source_link,
};
