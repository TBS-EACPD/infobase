import { Fragment } from "react";

import { get_client } from "../../../graphql_utils/graphql_utils.js";
import {
  gov_covid_summary_query,
  org_covid_summary_query,
} from "../../../models/covid/queries.js";

import {
  create_text_maker_component,
  declare_panel,
  StdPanel,
  Col,
  util_components,
  StandardLegend,
  WrappedNivoBar,
  businessConstants,
} from "../shared.js";

const { SpinnerWrapper } = util_components;

import text from "./covid_overview.yaml";
const { text_maker, TM } = create_text_maker_component([text]);

const { estimates_docs } = businessConstants;

// Copied from covid_estimates.js, TODO centralize these estimates utils somewhere
const get_est_doc_name = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc][window.lang] : "";

const get_query = (level) =>
  ({
    gov: { gov_covid_summary_query },
    dept: { org_covid_summary_query },
  }[level]);

const get_text_args = (subject, covid_summary) => {
  // TODO
  return {};
};

const CovidOverviewGraph = ({
  covid_summary: { covid_estimates, covid_expenditures, covid_commitments },
}) => {
  const colors = window.infobase_colors();

  const index_key = "index";

  const graph_data = [
    {
      [index_key]: text_maker("estimates"),
      ..._.chain(covid_estimates)
        .map(({ est_doc, vote, stat }) => [
          get_est_doc_name(est_doc),
          vote + stat,
        ])
        .fromPairs()
        .value(),
    },
    {
      [index_key]: text_maker("spending"),
      [text_maker("expenditures")]: _.reduce(
        covid_expenditures,
        (memo, { vote, stat }) => memo + vote + stat,
        0
      ),
      [text_maker("covid_commitments")]: _.reduce(
        covid_commitments,
        (memo, { commitment }) => memo + commitment,
        0
      ),
    },
  ];

  const graph_keys = _.chain(graph_data)
    .flatMap(_.keys)
    .uniq()
    .difference([index_key])
    .value();

  const legend_items = _.map(graph_keys, (key) => ({
    id: key,
    label: key,
    color: colors(key),
  }));

  return (
    <div className="frow">
      <div className="fcol-md-3" style={{ alignSelf: "center" }}>
        <StandardLegend
          items={legend_items}
          isHorizontal={false}
          LegendCheckBoxProps={{ isSolidBox: true }}
        />
      </div>
      <div className="fcol-md-9">
        <WrappedNivoBar
          data={graph_data}
          keys={graph_keys}
          indexBy={index_key}
          colorBy={(d) => colors(d.id)}
          margin={{
            top: 50,
            right: 80,
            bottom: 90,
            left: 80,
          }}
          bttm_axis={{
            tickSize: 3,
            tickRotation: -45,
            tickPadding: 10,
          }}
          enableGridX={false}
          remove_left_axis={false}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 12,
                  fill: window.infobase_color_constants.textColor,
                  fontWeight: "550",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

class CovidOverviewPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      covid_summary: null,
    };
  }
  componentDidMount() {
    const {
      subject: { id, level },
    } = this.props;

    const [query_name, query] = _.chain(level)
      .thru(get_query)
      .toPairs()
      .first()
      .value();

    get_client()
      .query({
        query,
        variables: {
          lang: window.lang,
          ...(level === "dept" && { id }),
          _query_name: query_name,
        },
      })
      .then(({ data: { root: { [level]: { covid_summary } } } }) =>
        this.setState({
          covid_summary,
          loading: false,
        })
      );
  }
  render() {
    const { subject, panel_args, footnotes, sources } = this.props;
    const { loading, covid_summary } = this.state;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      return (
        <StdPanel
          title={text_maker("covid_overview_panel_title")}
          {...{
            sources,
            footnotes,
          }}
        >
          <Col isText size={12}>
            <TM
              k={`covid_overview_panel_text_${subject.level}`}
              args={get_text_args(subject, covid_summary)}
            />
          </Col>
          <Col isGraph={!window.is_a11y_mode} size={12}>
            <CovidOverviewGraph covid_summary={covid_summary} />
          </Col>
        </StdPanel>
      );
    }
  }
}

export const declare_covid_overview_panel = () =>
  declare_panel({
    panel_key: "covid_summary_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      initial_queries: get_query(level_name),
      footnotes: false,
      source: (subject) => [],
      calculate: _.constant(false),
      render: ({
        calculations: { subject, panel_args },
        footnotes,
        sources,
      }) => (
        <CovidOverviewPanel {...{ subject, panel_args, footnotes, sources }} />
      ),
    }),
  });
