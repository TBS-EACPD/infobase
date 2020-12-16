import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  Subject,
} from "../shared.js";

const { CovidMeasure } = Subject;

import text from "./covid_measures.yaml";

const { text_maker, TM } = create_text_maker_component([text]);

export const declare_covid_measures_panel = () =>
  declare_panel({
    panel_key: "covid_measures_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_covid_measures: true,
      footnotes: false,
      source: (subject) => [],
      calculate: _.constant(false), //level_name === "dept" ? subject.has_data("covid_response") : true
      render: ({ calculations, footnotes, sources }) => {
        return (
          <InfographicPanel
            title={text_maker("covid_measures_panel_title")}
            {...{
              sources,
              footnotes,
            }}
          >
            {`A drilldown of measures?`}
          </InfographicPanel>
        );
      },
    }),
  });
