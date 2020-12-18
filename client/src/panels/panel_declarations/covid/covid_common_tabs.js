import { Fragment } from "react";

import {
  Subject,
  util_components,
  infograph_options_href_template,
  create_text_maker_component,
} from "../shared.js";

import {
  get_est_doc_name,
  get_est_doc_order,
  est_doc_sort_func,
} from "./covid_common_utils.js";

import common_covid_text from "./covid_common_lang.yaml";
import estimates_text from "./covid_estimates.yaml";
import expenditures_text from "./covid_expenditures.yaml";

const { CovidMeasure, Dept } = Subject;
const { SmartDisplayTable } = util_components;

const { text_maker, TM } = create_text_maker_component([
  common_covid_text,
  estimates_text,
  expenditures_text,
]);

const AboveTabFootnoteList = ({ children }) => (
  <Fragment>
    <TM k={"covid_above_tab_footnote_title"} className="bold" el="span" />
    <div style={{ lineHeight: "normal" }}>{children}</div>
  </Fragment>
);

const get_budgetary_name = (is_budgetary) => {
  if (_.isString(is_budgetary)) {
    return _.lowerCase(is_budgetary) === "true"
      ? text_maker("budgetary")
      : text_maker("non_budgetary");
  } else {
    return is_budgetary ? text_maker("budgetary") : text_maker("non_budgetary");
  }
};

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

export { AboveTabFootnoteList, ByDepartmentTab, ByMeasureTab };
