import _ from "lodash";
import React from "react";

import {InfographicPanel} from "src/panels/panel_declarations/InfographicPanel.js";
import {
  declare_panel,
} from "src/panels/panel_declarations/shared.js";


import { COVID_EXPENDITUES_FLAG } from "src/models/covid/covid_config.js";
import { gov_covid_summary_query } from "src/models/covid/queries.js";

import { lang } from "src/core/injected_build_constants.js";

import { TabLoadingSpinner } from "src/components";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { covid_create_text_maker_component } from "./covid_text_provider.js";

import text from "./covid_intro.yaml";

const { text_maker, TM } = covid_create_text_maker_component(text);

const client = get_client();

class CovidIntroPanelDyanmicText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      covid_summary: null,
    };
  }
  componentDidMount() {
    client
      .query({
        query: gov_covid_summary_query,
        variables: {
          lang: lang,
          _query_name: "gov_covid_summary_query",
        },
      })
      .then(({ data: { root: { gov: { covid_summary } } } }) =>
        this.setState({
          covid_summary,
          loading: false,
        })
      );
  }
  render() {
    const { panel_args } = this.props;
    const { loading, covid_summary } = this.state;

    if (loading) {
      return <TabLoadingSpinner />;
    } else {
      const { covid_estimates, covid_expenditures } = covid_summary;
      const {
        gov_total_covid_estimates,
        gov_total_covid_expenditures,
      } = _.chain({ covid_estimates, covid_expenditures })
        .mapValues((summaries) =>
          _.chain(summaries)
            .groupBy("fiscal_year")
            .toPairs()
            .sortBy(_.first)
            .first()
            .thru(([_fiscal_year, rows]) =>
              _.reduce(rows, (memo, { vote, stat }) => memo + vote + stat, 0)
            )
            .value()
        )
        .mapKeys((_, key) => `gov_total_${key}`)
        .value();

      return (
        <div className="medium-panel-text">
          <TM
            k="covid_intro_auth"
            args={{
              ...panel_args,
              gov_total_covid_estimates,
            }}
          />
          {COVID_EXPENDITUES_FLAG && (
            <TM
              k="covid_intro_exp"
              args={{
                ...panel_args,
                gov_total_covid_expenditures,
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
      requires_has_covid_response: level_name === "dept",
      initial_queries: {
        gov_covid_summary_query,
      },
      footnotes: ["COVID"],
      source: (subject) => [],
      glossary_keys: ["MAINS", "SUPPS", "EXP"],
      calculate: _.constant(true),
      render: ({
        calculations: { panel_args, subject },
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
