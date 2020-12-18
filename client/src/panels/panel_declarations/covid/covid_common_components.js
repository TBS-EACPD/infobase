import { Fragment } from "react";

import {
  Subject,
  util_components,
  WrappedNivoBar,
  StandardLegend,
  infograph_options_href_template,
  create_text_maker_component,
  businessConstants,
} from "../shared.js";

import common_covid_text from "./covid_common_lang.yaml";
import estimates_text from "./covid_estimates.yaml";
import expenditures_text from "./covid_expenditures.yaml";

const { CovidMeasure, Dept } = Subject;
const { estimates_docs } = businessConstants;
const { SmartDisplayTable } = util_components;

const { text_maker, TM } = create_text_maker_component([
  common_covid_text,
  estimates_text,
  expenditures_text,
]);
const colors = window.infobase_colors();

const get_budgetary_name = (is_budgetary) => {
  if (_.isString(is_budgetary)) {
    return _.lowerCase(is_budgetary) === "true"
      ? text_maker("budgetary")
      : text_maker("non_budgetary");
  } else {
    return is_budgetary ? text_maker("budgetary") : text_maker("non_budgetary");
  }
};
const get_est_doc_name = (est_doc) =>
  estimates_docs[est_doc] ? estimates_docs[est_doc][window.lang] : "";
const data_types_constants = {
  estimates: {
    index_key: "est_doc",
    get_index_name: get_est_doc_name,
    panel_key: "covid_estimates_panel",
  },
  expenditures: {
    index_key: "is_budgetary",
    get_index_name: get_budgetary_name,
    panel_key: "covid_expenditures_panel",
  },
};

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

const get_plain_string = (string) =>
  _.chain(string).deburr().lowerCase().value();
const string_sort_func = (a, b) => {
  const plain_a = get_plain_string(a);
  const plain_b = get_plain_string(b);

  if (plain_a < plain_b) {
    return -1;
  } else if (plain_a > plain_b) {
    return 1;
  }
  return 0;
};

const get_common_column_configs = (data_type) => {
  const { index_key, get_index_name } = data_types_constants[data_type];
  return {
    [index_key]: {
      index: 1,
      header: text_maker(
        data_type === "estimates" ? `covid_estimates_doc` : "budgetary"
      ),
      is_searchable: true,
      formatter: get_index_name,
      raw_formatter: get_index_name,
      sort_func: data_type === "estimates" ? est_doc_sort_func : undefined,
    },
    stat: {
      index: 2,
      header: text_maker(`covid_${data_type}_stat`),
      is_searchable: false,
      is_summable: true,
      formatter: "compact2",
    },
    vote: {
      index: 3,
      header: text_maker(`covid_${data_type}_voted`),
      is_searchable: false,
      is_summable: true,
      formatter: "compact2",
    },
  };
};

const SummaryTab = ({ panel_args, data }) => {
  const { subject, data_type } = panel_args;
  const { index_key, get_index_name } = data_types_constants[data_type];

  const graph_index_key = "index_key";

  const graph_data = _.chain(data)
    .map((row) => ({
      [graph_index_key]: get_index_name(row[index_key]),
      [text_maker(`covid_${data_type}_stat`)]: row.stat,
      [text_maker(`covid_${data_type}_voted`)]: row.vote,
    }))
    .value();

  const graph_keys = _.chain(graph_data)
    .first()
    .omit(graph_index_key)
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
      indexBy={graph_index_key}
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

  const additional_text_args = (() => {
    const index_summary_stats = _.map(data, (row) => [
      get_index_name(row[index_key]),
      row.vote + row.stat,
    ]);

    if (subject.level === "gov") {
      return {
        index_summary_stats,
        covid_auth_pct_of_gov_auth:
          panel_args[`gov_covid_${data_type}_in_year`] /
          panel_args[`gov_total_${data_type}_in_year`],
      };
    } else {
      const dept_covid_data_in_year = _.reduce(
        data,
        (memo, { stat, vote }) => memo + vote + stat,
        0
      );

      return {
        index_summary_stats,
        dept_covid_data_in_year,
        covid_auth_pct_of_gov_auth:
          dept_covid_data_in_year /
          panel_args[`gov_total_${data_type}_in_year`],
      };
    }
  })();

  return (
    <div className="frow middle-xs">
      <div className="fcol-xs-12 fcol-md-6 medium-panel-text">
        <TM
          k={`covid_${data_type}_summary_text_${subject.level}`}
          args={{ ...panel_args, ...additional_text_args }}
        />
        <TM
          k={`covid_${data_type}_by_index_key`}
          args={{ ...panel_args, ...additional_text_args }}
        />
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

const ByDepartmentTab = ({ panel_args, data }) => {
  const { data_type } = panel_args;
  const { panel_key } = data_types_constants[data_type];
  // pre-sort by key, so presentation consistent when sorting by other col
  const pre_sorted_dept_data = _.sortBy(data, ({ est_doc }) =>
    get_est_doc_order(est_doc)
  );

  const column_configs = {
    org_id: {
      index: 0,
      header: text_maker("department"),
      is_searchable: true,
      formatter: (org_id) => {
        const org = Dept.lookup(org_id);

        return (
          <a
            href={infograph_options_href_template(org, "covid", {
              panel_key,
            })}
          >
            {org.name}
          </a>
        );
      },
      raw_formatter: (org_id) => Dept.lookup(org_id).name,
      sort_func: (org_id_a, org_id_b) => {
        const org_a = Dept.lookup(org_id_a);
        const org_b = Dept.lookup(org_id_b);
        return string_sort_func(org_a.name, org_b.name);
      },
    },
    ...get_common_column_configs(data_type),
  };

  const [largest_dept_id, largest_dept_auth] = _.chain(pre_sorted_dept_data)
    .groupBy("org_id")
    .mapValues((data) =>
      _.reduce(data, (memo, { vote, stat }) => memo + vote + stat, 0)
    )
    .toPairs()
    .sortBy(([org_id, total]) => total)
    .last()
    .value();

  return (
    <Fragment>
      <TM
        k={`covid_${data_type}_department_tab_text`}
        args={{
          largest_dept_name: Dept.lookup(largest_dept_id).name,
          largest_dept_auth,
        }}
        className="medium-panel-text"
      />
      <SmartDisplayTable
        data={_.map(pre_sorted_dept_data, (row) =>
          _.pick(row, _.keys(column_configs))
        )}
        column_configs={column_configs}
        table_name={text_maker("by_department_tab_label")}
      />
    </Fragment>
  );
};

const ByMeasureTab = ({ data, panel_args }) => {
  const { data_type } = panel_args;
  const { index_key } = data_types_constants[data_type];
  // pre-sort by key, so presentation consistent when sorting by other col
  const pre_sorted_data = _.chain(data)
    .map((row) => ({
      ...row,
      measure_name: CovidMeasure.lookup(row.measure_id).name,
    }))
    .sortBy(data, (row) =>
      data_type === "estimates" ? get_est_doc_order(row[index_key]) : index_key
    )
    .reverse()
    .value();

  const column_configs = {
    measure_name: {
      index: 0,
      header: text_maker("covid_measure"),
      is_searchable: true,
      sort_func: (name) => string_sort_func(name),
    },
    ...get_common_column_configs(data_type),
  };

  const [largest_measure_name, largest_measure_auth] = _.chain(pre_sorted_data)
    .groupBy("measure_name")
    .map((rows, measure_name) => [
      measure_name,
      _.reduce(rows, (memo, { vote, stat }) => memo + vote + stat, 0),
    ])
    .sortBy(([_measure_name, total]) => total)
    .last()
    .value();

  return (
    <Fragment>
      <TM
        k={`covid_${data_type}_measure_tab_text`}
        args={{
          largest_measure_name,
          largest_measure_auth,
        }}
        className="medium-panel-text"
      />
      <SmartDisplayTable
        data={_.map(pre_sorted_data, (row) =>
          _.pick(row, _.keys(column_configs))
        )}
        column_configs={column_configs}
        table_name={text_maker("by_measure_tab_label")}
      />
    </Fragment>
  );
};

const AboveTabFootnoteList = ({ list_text_key }) => (
  <Fragment>
    <TM k={"covid_above_tab_footnote_title"} className="bold" el="span" />
    <TM k={list_text_key} style={{ lineHeight: "normal" }} />
  </Fragment>
);

export { SummaryTab, ByDepartmentTab, ByMeasureTab, AboveTabFootnoteList };
