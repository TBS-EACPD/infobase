import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import { COVID_EXPENDITUES_FLAG } from "src/models/covid/covid_config.js";
import { query_gov_covid_summaries } from "src/models/covid/queries.js";

import { Subject } from "src/models/subject.js";

import { TabLoadingSpinner } from "src/components";

import { YearSelectionTabs } from "./covid_common_components.js";
import { get_date_last_updated } from "./covid_common_utils.js";

import { covid_create_text_maker_component } from "./covid_text_provider.js";

import text from "./covid_intro.yaml";

const { YearsWithCovidData } = Subject;

const { text_maker, TM } = covid_create_text_maker_component(text);

class CovidIntroPanelDyanmicText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selected_year: _.chain(YearsWithCovidData.lookup("gov"))
        .thru(({ years_with_estimates, years_with_expenditures }) =>
          COVID_EXPENDITUES_FLAG
            ? [...years_with_estimates, ...years_with_expenditures]
            : years_with_estimates
        )
        .uniq()
        .sortBy()
        .last()
        .value(),
      summaries_by_year: null,
    };
  }
  componentDidMount() {
    query_gov_covid_summaries().then((covid_summaries) => {
      this.setState({
        loading: false,
        summaries_by_year: _.chain(covid_summaries)
          .map(({ fiscal_year, covid_estimates, covid_expenditures }) => [
            fiscal_year,
            COVID_EXPENDITUES_FLAG
              ? { covid_estimates, covid_expenditures }
              : { covid_estimates },
          ])
          .filter(([_fiscal_year, summaries]) => !_.isEmpty(summaries))
          .fromPairs()
          .value(),
      });
    });
  }
  on_select_year = (year) => this.setState({ selected_year: year });
  render() {
    const { panel_args } = this.props;
    const { loading, selected_year, summaries_by_year } = this.state;

    if (loading) {
      return <TabLoadingSpinner />;
    } else {
      const { covid_estimates, covid_expenditures } = summaries_by_year[
        selected_year
      ];

      return (
        <div className="medium-panel-text">
          <YearSelectionTabs
            years={_.map(
              summaries_by_year,
              (_summary, fiscal_year) => +fiscal_year
            )}
            on_select_year={this.on_select_year}
            selected_year={selected_year}
          />
          {!_.isEmpty(covid_estimates) && (
            <TM
              k="covid_intro_est"
              args={{
                ...panel_args,
                fiscal_year: selected_year,
                gov_total_covid_estimates: _.reduce(
                  covid_estimates,
                  (memo, { vote, stat }) => memo + vote + stat,
                  0
                ),
              }}
            />
          )}
          {!_.isUndefined(covid_expenditures) &&
            !_.isNull(covid_expenditures.month_last_updated) && (
              <TM
                k="covid_intro_exp"
                args={{
                  ...panel_args,
                  fiscal_year: selected_year,
                  date_last_updated: get_date_last_updated(
                    selected_year,
                    covid_expenditures.month_last_updated
                  ),
                  gov_total_covid_expenditures:
                    covid_expenditures.vote + covid_expenditures.stat,
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
