import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { LeafSpinner } from "src/components/index";

import { promisedGovCovidSummaries } from "src/models/covid/queries";
import { yearsWithCovidDataStore } from "src/models/covid/yearsWithCovidDataStore";

import { YearSelectionTabs } from "./covid_common_components";
import {
  get_date_last_updated_text,
  get_est_doc_list_plain_text,
} from "./covid_common_utils";

import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_intro.yaml";

const { text_maker, TM } = covid_create_text_maker_component(text);

class CovidIntroPanelDyanmicText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selected_year: _.chain(yearsWithCovidDataStore.lookup("gov"))
        .thru(({ years_with_estimates, years_with_expenditures }) => [
          ...years_with_estimates,
          ...years_with_expenditures,
        ])
        .uniq()
        .sortBy()
        .last()
        .value(),
      summaries_by_year: null,
    };
  }
  componentDidMount() {
    promisedGovCovidSummaries().then((covid_summaries) => {
      this.setState({
        loading: false,
        summaries_by_year: _.chain(covid_summaries)
          .map(({ fiscal_year, covid_estimates, covid_expenditures }) => [
            fiscal_year,
            { covid_estimates, covid_expenditures },
          ])
          .filter(([_fiscal_year, summaries]) => !_.isEmpty(summaries))
          .fromPairs()
          .value(),
      });
    });
  }
  on_select_year = (year) => this.setState({ selected_year: year });
  render() {
    const { calculations } = this.props;
    const { loading, selected_year, summaries_by_year } = this.state;

    if (loading) {
      return <LeafSpinner config_name={"subroute"} />;
    } else {
      const { covid_estimates, covid_expenditures } =
        summaries_by_year[selected_year];

      const est_docs_in_year = _.chain(covid_estimates)
        .reduce((est_docs, { est_doc }) => [...est_docs, est_doc], [])
        .value();

      return (
        <YearSelectionTabs
          years={_.map(
            summaries_by_year,
            (_summary, fiscal_year) => +fiscal_year
          )}
          on_select_year={this.on_select_year}
          selected_year={selected_year}
        >
          {!_.isEmpty(covid_estimates) && (
            <TM
              k="covid_intro_est"
              args={{
                ...calculations,
                selected_year,
                gov_tabled_est_docs_in_year_text:
                  get_est_doc_list_plain_text(est_docs_in_year),
                est_docs_in_year_are_plural: est_docs_in_year.length > 1,
                gov_covid_estimates_in_year: _.reduce(
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
                  ...calculations,
                  selected_year,
                  date_last_updated_text: get_date_last_updated_text(
                    selected_year,
                    covid_expenditures.month_last_updated
                  ),
                  gov_covid_expenditures_in_year:
                    covid_expenditures.vote + covid_expenditures.stat,
                }}
              />
            )}
          <TM k={"covid_intro_notice"} />
        </YearSelectionTabs>
      );
    }
  }
}

export const declare_covid_intro_panel = () =>
  declare_panel({
    panel_key: "covid_intro",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_years_with_covid_data"],
      get_title: () => text_maker("covid_intro_panel_title"),
      get_dataset_keys: () => ["covid_auth", "covid_exp"],
      get_topic_keys: () => ["COVID", "MACHINERY"],
      glossary_keys: ["MAINS", "SUPPS", "EXP"],
      render: ({
        title,
        calculations,
        footnotes,
        sources,
        datasets,
        glossary_keys,
      }) => (
        <InfographicPanel
          {...{
            title,
            sources,
            datasets,
            footnotes,
            glossary_keys,
          }}
        >
          <div className="medium-panel-text">
            <CovidIntroPanelDyanmicText calculations={calculations} />
          </div>
        </InfographicPanel>
      ),
    }),
  });
