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
const get_est_doc_order = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc].order : 9999;
const est_doc_sort_func = (est_doc_a, est_doc_b) => {
  const order_a = get_est_doc_order(est_doc_a);
  const order_b = get_est_doc_order(est_doc_b);

  if (order_a < order_b) {
    return -1;
  } else if (order_a > order_b) {
    return 1;
  }
  return 0;
};

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

  debugger; //eslint-disable-line

  const graph_data = [
    {
      [index_key]: "TODO: authorized spending",
      ..._.chain(covid_estimates)
        .map(({ est_doc, vote, stat }) => [
          get_est_doc_name(est_doc),
          vote + stat,
        ])
        .fromPairs()
        .value(),
    },
    {
      [index_key]: "TODO: actual and committed spending",
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
    <Fragment>
      <StandardLegend
        items={legend_items}
        isHorizontal={true}
        LegendCheckBoxProps={{ isSolidBox: true }}
      />
      <WrappedNivoBar
        data={graph_data}
        keys={graph_keys}
        indexBy={index_key}
        colorBy={(d) => colors(d.id)}
        margin={{
          top: 50,
          right: 40,
          bottom: 120,
          left: 40,
        }}
        bttm_axis={{
          format: (d) =>
            _.words(d).length > 3 ? d.substring(0, 20) + "..." : d,
          tickSize: 3,
          tickRotation: -45,
          tickPadding: 10,
        }}
        graph_height="450px"
        enableGridX={false}
        remove_left_axis={true}
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
    </Fragment>
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
          <Col isText size={6}>
            <TM
              k={`covid_overview_panel_text_${subject.level}`}
              args={get_text_args(subject, covid_summary)}
            />
          </Col>
          <Col isGraph={!window.is_a11y_mode} size={6}>
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
      calculate: _.constant(true),
      render: ({
        calculations: { subject, panel_args },
        footnotes,
        sources,
      }) => (
        <CovidOverviewPanel {...{ subject, panel_args, footnotes, sources }} />
      ),
    }),
  });
