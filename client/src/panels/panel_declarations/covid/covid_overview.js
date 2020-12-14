import {
  gov_covid_summary_query,
  org_covid_summary_query,
} from "../../../models/covid/queries.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
} from "../shared.js";

import text from "./covid_overview.yaml";

const { text_maker, TM } = create_text_maker_component([text]);

export const declare_covid_overview_panel = () =>
  declare_panel({
    panel_key: "covid_summary_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      initial_queries: {
        gov: { gov_covid_summary_query },
        dept: { org_covid_summary_query },
      }[level_name],
      footnotes: false,
      source: (subject) => [],
      calculate: _.constant(true),
      render: ({ calculations, footnotes, sources }) => {
        return (
          <InfographicPanel
            title={text_maker("covid_overview_panel_title")}
            {...{
              sources,
              footnotes,
            }}
          >
            {`TODO high level comparison of estimates vs current expenditures + commitments.
            ... might be necessary to identify and split out expenditures on non-estimates based 
            measures, if those don't end up excluded (splitting those out will need to happen server side)`}
          </InfographicPanel>
        );
      },
    }),
  });
