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
  infograph_options_href_template,
} from "../../shared.js";

import text from "./covid_estimates.yaml";

const { CovidEstimates, CovidInitiatives, CovidMeasures, Dept } = Subject;

const {
  TabbedContent,
  SpinnerWrapper,
  SmartDisplayTable,
  default_dept_name_sort_func,
} = util_components;

const { text_maker, TM } = create_text_maker_component([text]);

const SummaryTab = ({ panel_args }) => {
  const { covid_estimates_data } = panel_args;

  const colors = infobase_colors();

  const graph_data = _.chain(covid_estimates_data)
    .map(({ doc_name, stat, vote }) => ({
      doc_name,
      [text_maker("stat_items")]: stat,
      [text_maker("voted")]: vote,
    }))
    .value();

  const graph_keys = _.chain(graph_data)
    .first()
    .omit("doc_name")
    .keys()
    .value();

  const legend_items = _.map(graph_keys, (key) => ({
    id: key,
    label: key,
    color: colors(key),
  }));

  const graph_content = (
    <WrappedNivoBar
      data={graph_data}
      keys={graph_keys}
      indexBy="doc_name"
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

const ByDepartmentTab = ({ panel_args }) => {
  const all_dept_estimates = CovidEstimates.get_all();

  const column_configs = {
    org: {
      index: 0,
      header: text_maker("department"),
      is_searchable: true,
      formatter: (org) => (
        <a
          href={infograph_options_href_template(org, "financial", {
            panel_key: "covid_estimates_pane",
          })}
        >
          {org.name}
        </a>
      ),
      raw_formatter: (org) => org.name,
      sort_func: (org_a, org_b) =>
        default_dept_name_sort_func(org_a.id, org_b.id),
    },
    doc_name: {
      index: 1,
      header: text_maker("covid_estimates_estimates_doc"),
      is_searchable: true,
    },
    stat: {
      index: 2,
      header: text_maker("stat_items"),
      is_searchable: false,
      is_summable: true,
      formatter: "compact2_written",
    },
    vote: {
      index: 3,
      header: text_maker("voted"),
      is_searchable: false,
      is_summable: true,
      formatter: "compact2_written",
    },
  };

  return (
    <SmartDisplayTable
      data={_.map(all_dept_estimates, (row) =>
        _.pick(row, _.keys(column_configs))
      )}
      column_configs={column_configs}
      table_name={text_maker("covid_estimates_department_tab_label")}
    />
  );
};

const ByInitiativeTab = ({ panel_args }) => {
  const { subject } = panel_args;
  const initiatives =
    subject.level === "dept"
      ? CovidInitiatives.org_lookup(subject.org_id)
      : CovidInitiatives.get_all();

  //const column_configs = {
  //  [indexBy]: {
  //    index: 0,
  //    header: table_first_column_name || nivo_common_text_maker("label"),
  //    is_searchable: true,
  //  },
  //  ..._.chain(keys)
  //    .map((key, idx) => [
  //      key,
  //      {
  //        index: idx + 1,
  //        header: key,
  //        formatter: (value) =>
  //          _.isUndefined(value) ? "" : table_view_format(value),
  //      },
  //    ])
  //    .fromPairs()
  //    .value(),
  //};
  //return (
  //  <SmartDisplayTable
  //    data={_.map(initiatives, (row) => _.pick(row, _.keys(column_configs)))}
  //    table_name={text_maker("covid_estimates_initiative_tab_label")}
  //  />
  //);
  return "TODO";
};

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
          ({ doc_name, vote, stat }) => [doc_name, vote + stat]
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
