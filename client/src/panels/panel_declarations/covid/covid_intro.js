import _ from "lodash";
import React from "react";

import { gov_covid_summary_query } from "src/models/covid/queries.js";

import { lang } from "src/core/injected_build_constants.js";

import { Details, TabLoadingSpinner } from "src/components";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { InfographicPanel, declare_panel } from "../shared.js";

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
      const { measure_counts, org_counts } = covid_summary;

      const orgs_with_spending = _.first(org_counts)?.with_spending;
      const measures_with_authorities = _.first(measure_counts)
        ?.with_authorities;

      return (
        <TM
          k="covid_intro_dynamic_text"
          args={{
            ...panel_args,
            orgs_with_spending,
            measures_with_authorities,
          }}
          className="medium-panel-text"
        />
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
          <TM
            k="covid_intro_static_text"
            args={panel_args}
            className="medium-panel-text"
          />
          <CovidIntroPanelDyanmicText panel_args={panel_args} />
          <Details
            summary_content={text_maker("covid_intro_links_summary")}
            content={<TM k="covid_intro_links_content" />}
          />
        </InfographicPanel>
      ),
    }),
  });
