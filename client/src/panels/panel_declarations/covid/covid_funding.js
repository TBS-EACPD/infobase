// old covid expenditures panel code, likely to reuse a decent amount for the new funding panel

import _ from "lodash";
import React, { Fragment } from "react";

import {
  gov_covid_summary_query,
  org_covid_summary_query,
} from "src/models/covid/queries.js";

import { lang } from "src/core/injected_build_constants.js";

import { get_client } from "src/graphql_utils/graphql_utils.js";

import { infograph_options_href_template } from "src/infographic/infographic_link.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  util_components,
  Subject,
  ensure_loaded,
  formats,
  WrappedNivoPie,
} from "../shared.js";

import {
  AboveTabFootnoteList,
  CellTooltip,
} from "./covid_common_components.js";
import {
  get_tabbed_content_props,
  wrap_with_vote_stat_controls,
  string_sort_func,
} from "./covid_common_utils.js";

import text2 from "./covid_common_lang.yaml";
import text1 from "./covid_funding.yaml";

const { CovidMeasure, Gov } = Subject;

const { text_maker, TM } = create_text_maker_component([text1, text2]);
const {
  TabbedContent,
  SpinnerWrapper,
  AlertBanner,
  SmartDisplayTable,
} = util_components;

const client = get_client();

// TODO, would rather not hard code this here, but where else could it live?
const last_refreshed_date = { en: "December 31, 2020", fr: "31 décembre 2020" }[
  lang
];

const panel_key = "covid_funding_panel";

const SummaryTab = ({
  args: panel_args,
  data: { covid_expenditures, covid_funding },
}) => {
  const { covid_funding_in_year, covid_expenditures_in_year } = panel_args;

  const pie_data = [
    {
      id: "spent",
      label: text_maker("covid_spent_funding"),
      value: covid_expenditures_in_year,
    },
    {
      id: "remaining",
      label: text_maker("covid_remaining_funding"),
      value: covid_funding_in_year - covid_expenditures_in_year,
    },
  ];

  return (
    <div className="frow middle-xs">
      <div className="fcol-xs-12 fcol-md-6">
        <TM
          k={`covid_funding_summary_text`}
          args={{
            ...panel_args,
            covid_funding_in_year,
            covid_expenditures_in_year,
          }}
          className="medium-panel-text"
        />
      </div>
      <div className="fcol-xs-12 fcol-md-6">
        <WrappedNivoPie data={pie_data} />
      </div>
    </div>
  );
};

const ByMeasureTab = wrap_with_vote_stat_controls(
  ({
    show_vote_stat,
    ToggleVoteStat,
    args: panel_args,
    data: { covid_expenditures },
  }) => {
    const rows = _.chain(CovidMeasure.get_all())
      .map(({ id: measure_id, name: measure_name, covid_funding }) => {
        const funding = _.first(covid_funding)?.funding || null;

        const { vote, stat } = _.find(covid_expenditures, { measure_id }) || {
          vote: 0,
          stat: 0,
        };

        return {
          measure_name,
          funding,
          vote,
          stat,
          total_exp: vote + stat,
          funding_used: !_.isNull(funding)
            ? 1 - (funding - (vote + stat)) / funding
            : null,
        };
      })
      .filter(({ funding, vote, stat }) => funding || vote || stat)
      .value();

    const column_configs = {
      measure_name: {
        index: 0,
        header: text_maker("covid_measure"),
        is_searchable: true,
        sort_func: (name_a, name_b) => string_sort_func(name_a, name_b),
      },
      funding: {
        index: 1,
        header: text_maker("covid_funding"),
        is_searchable: false,
        is_summable: true,
        raw_formatter: (value) => value || 0,
        formatter: (value) => {
          if (_.isNull(value)) {
            return (
              <span>
                {"—"}
                <CellTooltip
                  tooltip_text={text_maker(
                    "covid_funding_no_funding_explanation"
                  )}
                />
              </span>
            );
          } else {
            return formats.compact2_raw(value);
          }
        },
      },
      vote: {
        index: 2,
        header: text_maker(`covid_expenditures_voted`),
        is_searchable: false,
        is_summable: true,
        formatter: "compact2",
        initial_visible: show_vote_stat,
      },
      stat: {
        index: 3,
        header: text_maker(`covid_expenditures_stat`),
        is_searchable: false,
        is_summable: true,
        formatter: "compact2",
        initial_visible: show_vote_stat,
      },
      total_exp: {
        index: 4,
        header: text_maker(`covid_expenditures`),
        is_searchable: false,
        is_summable: true,
        formatter: "compact2",
        initial_visible: !show_vote_stat,
      },
      funding_used: {
        index: 5,
        header: text_maker(`covid_funding_used`),
        is_searchable: false,
        is_summable: false,
        raw_formatter: (value) => value || 0,
        formatter: (value) => {
          if (_.isNull(value)) {
            return "—";
          } else {
            return (
              <span>
                {formats.percentage2_raw(value)}
                {value > 1 && (
                  <CellTooltip
                    tooltip_text={text_maker(
                      "covid_funding_surpassing_funding_explanation"
                    )}
                  />
                )}
              </span>
            );
          }
        },
      },
    };

    const {
      measure_name: largest_measure_name,
      funding: largest_measure_funding,
      total_exp: largest_measure_exp,
    } = _.chain(rows).filter("funding").sortBy("funding").last().value();

    return (
      <Fragment>
        <TM
          k={`covid_funding_measure_tab_text`}
          args={{
            ...panel_args,
            largest_measure_name,
            largest_measure_funding,
            largest_measure_exp,
          }}
          className="medium-panel-text"
        />
        <ToggleVoteStat />
        <SmartDisplayTable
          data={rows}
          column_configs={column_configs}
          table_name={text_maker("by_measure_tab_label")}
          disable_column_select={true}
        />
      </Fragment>
    );
  }
);

const tab_content_configs = [
  {
    key: "summary",
    levels: ["gov"],
    label: text_maker("summary_tab_label"),
    load_data: (panel_args) =>
      client
        .query({
          query: gov_covid_summary_query,
          variables: {
            lang: lang,
            _query_name: "gov_covid_summary_query",
          },
        })
        .then((response) => _.get(response, "data.root.gov.covid_summary")),
    TabContent: SummaryTab,
  },
  {
    key: "measure",
    levels: ["gov"],
    label: text_maker("by_measure_tab_label"),
    load_data: () =>
      ensure_loaded({
        covid_expenditures: true,
        subject: Gov,
      }).then(() => ({
        covid_expenditures: CovidMeasure.gov_data_by_measure("expenditures"),
      })),
    TabContent: ByMeasureTab,
  },
];

class CovidFundingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
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
      .then(
        ({
          data: {
            root: {
              gov: {
                covid_summary: { covid_expenditures, covid_funding },
              },
            },
          },
        }) => {
          this.setState({
            covid_funding_in_year: _.first(covid_funding)?.funding || 0,
            covid_expenditures_in_year: _.reduce(
              covid_expenditures,
              (memo, { vote, stat }) => memo + vote + stat,
              0
            ),
            loading: false,
          });
        }
      );
  }
  render() {
    const {
      loading,
      covid_funding_in_year,
      covid_expenditures_in_year,
    } = this.state;
    const { panel_args } = this.props;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      const extended_panel_args = {
        ...panel_args,
        last_refreshed_date,
        covid_funding_in_year,
        covid_expenditures_in_year,
      };
      const tabbed_content_props = get_tabbed_content_props(
        tab_content_configs,
        extended_panel_args
      );

      return (
        <Fragment>
          <div className="medium-panel-text text">
            <AboveTabFootnoteList subject={panel_args.subject}>
              <TM k="covid_funding_above_tab_footnote_list" />
            </AboveTabFootnoteList>
          </div>
          <TabbedContent {...tabbed_content_props} />
        </Fragment>
      );
    }
  }
}

export const declare_covid_funding_panel = () =>
  declare_panel({
    panel_key,
    levels: ["gov"],
    panel_config_func: (level_name, panel_key) => ({
      initial_queries: {
        gov_covid_summary_query,
      },
      footnotes: false,
      source: (subject) => [],
      calculate: _.constant(true),
      render: ({ calculations, footnotes, sources }) => {
        const { panel_args, subject } = calculations;
        return (
          <InfographicPanel
            title={text_maker("covid_funding_panel_title")}
            {...{
              sources,
              footnotes,
            }}
          >
            <AlertBanner banner_class="danger">
              {"Real (but non-final) data. For development purposes only!"}
            </AlertBanner>
            <CovidFundingPanel panel_args={{ ...panel_args, subject }} />
          </InfographicPanel>
        );
      },
    }),
  });
