import { PanelRegistry } from "src/panels/PanelRegistry";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link";
import { Table } from "src/tables/TableClass";

const declare_panel = ({ panel_key, subject_types, panel_config_func }) => {
  // HACK WARNING: redeclarations on the same panel_key are quietly thrown out here, with no warning.
  // With the current flow for loading panels from the infographic route via `get_panels_for_subject`, which was designed for bundle splitting,
  // these declare_panel calls are repeated on every infographic bubble load. Untangling this will be a thorny TODO, but until we do there's
  // going to be a potential blind spot on miss-use of `declare_panel` and/or reused panel keys

  if (!PanelRegistry.is_registered_key(panel_key)) {
    subject_types.forEach(
      (subject_type) =>
        new PanelRegistry({
          subject_type,
          key: panel_key,
          ...panel_config_func(subject_type, panel_key),
        })
    );
  }

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
