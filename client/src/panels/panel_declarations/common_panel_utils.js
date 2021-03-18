import { PanelRegistry} from "src/panels/PanelRegistry.js";

import { Table } from "src/core/TableClass.js";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link.js";


const declare_panel = ({ panel_key, levels, panel_config_func }) => {
  if (!PanelRegistry.is_registered_panel_key(panel_key)) {
    levels.forEach(
      (level) =>
        new PanelRegistry({
          level,
          key: panel_key,
          ...panel_config_func(level, panel_key),
        })
    );
  }

  return panel_key;
};

const get_planned_spending_source_link = (subject) => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.lookup("programSpending");
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
  const table = Table.lookup("programFtes");
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

export{
  declare_panel,
  get_planned_spending_source_link,
  get_planned_fte_source_link,
}