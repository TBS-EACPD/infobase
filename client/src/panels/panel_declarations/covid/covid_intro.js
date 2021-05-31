import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { TabLoadingSpinner } from "src/components/index";

import { query_gov_covid_summaries } from "src/models/covid/queries";

import { Subject } from "src/models/subject";

import { get_source_links } from "src/metadata/data_sources";

import { YearSelectionTabs } from "./covid_common_components";
import {
  get_date_last_updated_text,
  get_est_doc_list_plain_text,
} from "./covid_common_utils";

import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_intro.yaml";

const { YearsWithCovidData } = Subject;

const { text_maker, TM } = covid_create_text_maker_component(text);

class CovidIntroPanelDyanmicText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selected_year: _.chain(YearsWithCovidData.lookup("gov"))
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
    query_gov_covid_summaries().then((covid_summaries) => {
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
    const { panel_args } = this.props;
    const { loading, selected_year, summaries_by_year } = this.state;

    if (loading) {
      return <TabLoadingSpinner />;
    } else {
      const { covid_estimates, covid_expenditures } =
        summaries_by_year[selected_year];

      return (
        <Fragment>
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
                selected_year,
                gov_tabled_est_docs_in_year_text: _.chain(covid_estimates)
                  .reduce((est_docs, { est_doc }) => [...est_docs, est_doc], [])
                  .thru(get_est_doc_list_plain_text)
                  .value(),
                gov_covid_estimates_in_year: _.reduce(
                  covid_estimates,
                  (memo, { vote, stat }) => memo + vote + stat,
                  0
                ),
                auth_total_note: null,
              }}
            />
          )}
          {!_.isUndefined(covid_expenditures) &&
            !_.isNull(covid_expenditures.month_last_updated) && (
              <TM
                k="covid_intro_exp"
                args={{
                  ...panel_args,
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
        </Fragment>
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
      title: text_maker("covid_intro_panel_title"),
      source: () => get_source_links(["COVID"]),
      glossary_keys: ["MAINS", "SUPPS", "EXP"],
      calculate: _.constant(true),
      render: ({
        title,
        calculations: { panel_args },
        footnotes,
        sources,
        glossary_keys,
      }) => (
        <InfographicPanel
          {...{
            title,
            sources,
            footnotes,
            glossary_keys,
          }}
        >
          <div className="medium-panel-text">
            <CovidIntroPanelDyanmicText panel_args={panel_args} />
          </div>
        </InfographicPanel>
      ),
    }),
  });
