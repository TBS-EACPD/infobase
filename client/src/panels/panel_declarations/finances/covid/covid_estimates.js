import { Fragment } from "react";

import {
  Subject,
  util_components,
  create_text_maker_component,
  InfographicPanel,
  ensure_loaded,
  declare_panel,
  formats,
  businessConstants,
  WrappedNivoBar,
  StandardLegend,
} from "../../shared.js";

import text from "./covid_estimates.yaml";

const { estimates_docs } = businessConstants;

const { CovidEstimates, CovidInitiatives, CovidMeasures, Dept } = Subject;

const { TabbedContent, SpinnerWrapper, SmartDisplayTable } = util_components;

const { text_maker, TM } = create_text_maker_component([text]);

const doc_code_to_doc_name = (doc_code) =>
  estimates_docs[doc_code][window.lang];

const SummaryTab = ({ panel_args }) => {
  const { covid_estimates_data } = panel_args;

  const colors = infobase_colors();

  const graph_data = _.chain(covid_estimates_data)
    .map(({ est_doc, stat, vote }) => ({
      est_doc: doc_code_to_doc_name(est_doc),
      [text_maker("stat_items")]: stat,
      [text_maker("voted")]: vote,
    }))
    .value();

  const graph_keys = _.chain(graph_data).first().omit("est_doc").keys().value();

  const legend_items = _.map(graph_keys, (key) => ({
    id: key,
    label: key,
    color: colors(key),
  }));

  const graph_content = (
    <WrappedNivoBar
      data={graph_data}
      keys={graph_keys}
      indexBy="est_doc"
      colorBy={(d) => colors(d.id)}
      margin={{
        top: 50,
        right: 40,
        bottom: 120,
        left: 40,
      }}
      bttm_axis={{
        format: (d) => (_.words(d).length > 3 ? d.substring(0, 20) + "..." : d),
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
  );

  return (
    <div className="frow middle-xs">
      <div className="fcol-xs-12 fcol-md-6 medium_panel_text">
        <TM k={"covid_estimates_summary_text"} args={panel_args} />
        <TM k={"covid_estimates_by_doc"} args={panel_args} />
      </div>
      <div className="fcol-xs-12 fcol-md-6">
        {!window.is_a11y_mode && (
          <StandardLegend
            items={legend_items}
            isHorizontal={true}
            LegendCheckBoxProps={{ isSolidBox: true }}
          />
        )}
        {graph_content}
      </div>
    </div>
  );
};

const ByDepartmentTab = ({ panel_args }) => "TODO";

const ByInitiativeTab = ({ panel_args }) => "TODO";

class TabLoadingWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    const { ensure_loaded_options } = this.props;

    ensure_loaded(ensure_loaded_options).then(() =>
      this.setState({ loading: false })
    );
  }
  render() {
    const { children } = this.props;

    const { loading } = this.state;

    return (
      <Fragment>
        {loading && (
          <div
            style={{
              position: "relative",
              height: "80px",
              marginBottom: "-10px",
            }}
          >
            <SpinnerWrapper config_name={"tabbed_content"} />
          </div>
        )}
        {!loading && children}
      </Fragment>
    );
  }
}

const get_gov_tabbed_content_props = (panel_args) => {
  return {
    tab_keys: ["summary", "department", "initiative"],
    tab_labels: {
      summary: text_maker("covid_estimates_summary_tab_label"),
      department: text_maker("covid_estimates_department_tab_label"),
      initiative: text_maker("covid_estimates_initiative_tab_label"),
    },
    tab_pane_contents: {
      summary: <SummaryTab panel_args={panel_args} />,
      department: (
        <TabLoadingWrapper
          ensure_loaded_options={{
            subject: panel_args.subject,
            covid_estimates: true,
          }}
        >
          <ByDepartmentTab panel_args={panel_args} />
        </TabLoadingWrapper>
      ),
      initiative: (
        <TabLoadingWrapper
          ensure_loaded_options={{
            subject: panel_args.subject,
            covid_initiatives: true,
          }}
        >
          <ByInitiativeTab panel_args={panel_args} />
        </TabLoadingWrapper>
      ),
    },
  };
};

const get_dept_tabbed_content_props = (panel_args) => {
  return {
    tab_keys: ["summary", "initiative"],
    tab_labels: {
      summary: text_maker("covid_estimates_summary_tab_label"),
      initiatives: text_maker("covid_estimates_initiative_tab_label"),
    },
    tab_pane_contents: {
      summary: <SummaryTab panel_args={panel_args} />,
      initiative: (
        <TabLoadingWrapper
          ensure_loaded_options={{
            subject: panel_args.subject,
            covid_initiatives: true,
          }}
        >
          <ByInitiativeTab panel_args={panel_args} />
        </TabLoadingWrapper>
      ),
    },
  };
};

const get_tabbed_content_props = (panel_args) =>
  panel_args.subject.level === "gov"
    ? get_gov_tabbed_content_props(panel_args)
    : get_dept_tabbed_content_props(panel_args);

export const declare_covid_estimates_panel = () =>
  declare_panel({
    panel_key: "covid_estimates_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_covid_estimates_gov_summary: level_name === "gov",
      requires_covid_estimates: level_name === "dept",
      footnotes: false,
      source: (subject) => [],
      calculate: (subject, options) => {
        const covid_estimates_data =
          level_name === "gov"
            ? CovidEstimates.get_gov_summary()
            : CovidEstimates.org_lookup(subject.id);

        if (_.isEmpty(covid_estimates_data)) {
          return false;
        }

        const est_doc_summary_stats = _.map(
          covid_estimates_data,
          ({ est_doc, vote, stat }) => [
            doc_code_to_doc_name(est_doc),
            vote + stat,
          ]
        );

        return {
          subject,
          covid_estimates_data,
          est_doc_summary_stats,
        };
      },
      render: ({ calculations, footnotes, sources }) => {
        const { panel_args } = calculations;

        const tabbed_content_props = get_tabbed_content_props(panel_args);

        return (
          <InfographicPanel
            title={text_maker("covid_estimates_panel_title")}
            {...{
              sources,
              footnotes,
            }}
          >
            <div className="frow">
              <div className="fcol-md-12 fcol-xs-12 medium_panel_text text">
                <TM k="covid_estimates_above_tab_text" args={panel_args} />
              </div>
            </div>
            <TabbedContent {...tabbed_content_props} />
          </InfographicPanel>
        );
      },
    }),
  });
