import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import { COVID_EXPENDITUES_FLAG } from "src/models/covid/covid_config.js";
import { query_gov_covid_summaries } from "src/models/covid/queries.js";

import { Subject } from "src/models/subject.js";

import { TabLoadingSpinner } from "src/components";

import { format_month_last_updated } from "./covid_common_utils.js";

import { covid_create_text_maker_component } from "./covid_text_provider.js";

import text from "./covid_intro.yaml";

const { YearsWithCovidData } = Subject;

const { text_maker, TM } = covid_create_text_maker_component(text);

class CovidIntroPanelDyanmicText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      latest_estimates_summary: null,
      latest_expenditures_summary: null,
    };
  }
  componentDidMount() {
    query_gov_covid_summaries().then((covid_summaries) => {
      const [latest_estimates_summary, latest_expenditures_summary] = _.map(
        ["estimates", "expenditures"],
        (data_type) => {
          const fiscal_year = +_.last(
            YearsWithCovidData.lookup("gov")[`years_with_${data_type}`]
          );

          return {
            fiscal_year,
            summary: _.chain(covid_summaries)
              .find({ fiscal_year })
              .get(`covid_${data_type}`)
              .value(),
          };
        }
      );

      this.setState({
        loading: false,
        latest_estimates_summary,
        latest_expenditures_summary,
      });
    });
  }
  render() {
    const { panel_args } = this.props;
    const {
      loading,
      latest_estimates_summary,
      latest_expenditures_summary,
    } = this.state;

    if (loading) {
      return <TabLoadingSpinner />;
    } else {
      return (
        <div className="medium-panel-text">
          <TM
            k="covid_intro_est"
            args={{
              ...panel_args,
              fiscal_year: latest_estimates_summary.fiscal_year,
              gov_total_covid_estimates: _.reduce(
                latest_estimates_summary.summary,
                (memo, { vote, stat }) => memo + vote + stat,
                0
              ),
            }}
          />
          {COVID_EXPENDITUES_FLAG && (
            <TM
              k="covid_intro_exp"
              args={{
                ...panel_args,
                fiscal_year: latest_expenditures_summary.fiscal_year,
                last_updated_date: format_month_last_updated(
                  latest_expenditures_summary.fiscal_year,
                  latest_expenditures_summary.summary.month_last_updated
                ),
                gov_total_covid_expenditures:
                  latest_expenditures_summary.summary.vote +
                  latest_expenditures_summary.summary.stat,
              }}
            />
          )}
        </div>
      );
    }
  }
}

export const declare_covid_intro_panel = () =>
  declare_panel({
    panel_key: "covid_intro",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_years_with_covid_data: true,
      footnotes: ["COVID"],
      source: (subject) => [],
      glossary_keys: ["MAINS", "SUPPS", "EXP"],
      calculate: _.constant(true),
      render: ({
        calculations: { panel_args },
        footnotes,
        sources,
        glossary_keys,
      }) => (
        <InfographicPanel
          title={text_maker("covid_intro_panel_title")}
          {...{
            sources,
            footnotes,
            glossary_keys,
          }}
        >
          <CovidIntroPanelDyanmicText panel_args={panel_args} />
        </InfographicPanel>
      ),
    }),
  });
