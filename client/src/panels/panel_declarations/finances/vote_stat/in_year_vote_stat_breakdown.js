import { sum } from "d3-array";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";

import { DisplayTable } from "src/components/index";

import { Dept } from "src/models/subjects";

import { newIBLightCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoTreemap } from "src/charts/wrapped_nivo/index";
import { infographic_href_template } from "src/infographic/infographic_href_template";

import { text_maker, TM } from "./vote_stat_text_provider";

const main_col = "{{est_in_year}}_estimates";

const text_func = (vs, d, break_str) => {
  if (vs == "voted") {
    return d.dept
      ? _.includes(d.desc, `${Dept.store.lookup(d.dept).name} ${break_str}  `)
        ? d.desc
        : `${Dept.store.lookup(d.dept).name} ${break_str}  ${d.desc}`
      : d.desc;
  } else {
    return d.dept
      ? _.includes(d.desc, ` ${break_str} ${Dept.store.lookup(d.dept).name}`)
        ? d.desc
        : `${d.desc} ${break_str} ${Dept.store.lookup(d.dept).name}`
      : d.desc;
  }
};

const d3_scale = scaleOrdinal(newIBLightCategoryColors);
const color_scale = (vs) =>
  function (d) {
    return d3_scale(text_func(vs, d, ""));
  };

const planned_vote_or_stat_render = (vs) =>
  function ({ title, calculations, footnotes, sources }) {
    const isVoted = vs === "voted";

    const { data, voted_stat_est_in_year } = calculations;

    const top_10_rows = _.take(data, 10);
    const total_amt = sum(data, _.property(main_col));

    const subj_map = _.chain(top_10_rows)
      .map((obj) => [
        obj.dept,
        infographic_href_template(Dept.store.lookup(obj.dept)),
      ])
      .fromPairs()
      .value();
    const table_data = _.map(top_10_rows, (obj) => ({
      name: obj.dept,
      voted_stat: obj.desc,
      amount: obj[main_col],
    }));

    const column_configs = {
      name: {
        index: 0,
        header: text_maker("org"),
        is_searchable: true,
        formatter: (value) =>
          subj_map[value] ? (
            <a href={subj_map[value]}>{Dept.store.lookup(value).name}</a>
          ) : (
            value
          ),
        plain_formatter: (value) =>
          value ? Dept.store.lookup(value).name : value,
      },
      voted_stat: {
        index: 1,
        header: text_maker(isVoted ? "voted" : "stat"),
        is_searchable: true,
      },
      amount: {
        index: 2,
        header: text_maker("authorities"),
        is_summable: true,
        formatter: "compact2_written",
      },
    };

    const data_with_complement_amt = _.concat(table_data, [
      {
        name: "",
        voted_stat: text_maker(
          isVoted ? "all_other_voted_items" : "all_other_stat_items"
        ),
        amount: _.last(data)[main_col],
      },
    ]);

    const packing_data = {
      name: "root",
      color: "white",
      children: _.map(data, (d, i) => ({
        ...d,
        id: i,
        total: total_amt,
        total_of: text_maker(isVoted ? "all_voted_items" : "all_stat_items"),
        desc: text_func(vs, d, "-"),
      })),
    };

    const show_pack = !is_a11y_mode;
    return (
      <StdPanel {...{ title, footnotes, sources }}>
        <Col isText size={12}>
          <TM
            k={
              isVoted
                ? "in_year_voted_breakdown_text"
                : "in_year_stat_breakdown_text"
            }
            args={{ voted_stat_est_in_year }}
          />
        </Col>
        <Col isGraph size={6}>
          <DisplayTable
            data={data_with_complement_amt}
            column_configs={column_configs}
          />
        </Col>
        {show_pack && (
          <Col isGraph size={6}>
            <div className="centerer" style={{ width: "100%" }}>
              <WrappedNivoTreemap
                data={packing_data}
                colorScale={color_scale(vs)}
                value_string="{{est_in_year}}_estimates"
                formatter={formats.compact1}
                label_id="desc"
              />
            </div>
          </Col>
        )}
      </StdPanel>
    );
  };

const planned_vote_or_stat_calculate =
  (vs) =>
  ({ subject, tables }) => {
    const { orgVoteStatEstimates } = tables;
    const { group_by_func, grouping_col_values_func } = orgVoteStatEstimates;

    const text = text_maker(vs);

    const all_rows = _.chain(orgVoteStatEstimates.data)
      .thru((data) => group_by_func(data, "vote_vs_stat"))
      .map((data_group) => [
        grouping_col_values_func(data_group[0], "vote_vs_stat")[1],
        data_group,
      ])
      .fromPairs()
      .get(text)
      .groupBy("dept")
      .flatMap((dept_group, dept) =>
        _.chain(dept_group)
          .groupBy("desc")
          .map((desc_group, desc) => ({
            dept,
            desc,
            [main_col]: _.reduce(
              desc_group,
              (memo, row) => memo + row[main_col],
              0
            ),
          }))
          .value()
      )
      .sortBy((x) => -x[main_col])
      .value();

    const ret = {};
    ret.data = _.take(all_rows, 10);
    if (vs === "voted") {
      //vote descriptions are of the form "<vote desc> - <vote num>"
      //lets strip out the hyphen and everything that follows
      ret.data.forEach((row) => (row.desc = row.desc.replace(/-.+$/, "")));
    }
    ret.data.push({
      desc: text_maker(`all_other_${vs}_items`),
      others: true,
      [main_col]: sum(
        _.takeRight(all_rows, all_rows.length - 10),
        (d) => d[main_col]
      ),
    });
    const voted_stat_est_in_year =
      orgVoteStatEstimates.sum_cols_by_grouped_data(
        main_col,
        "vote_vs_stat",
        subject
      )[text] || 0;

    return { ...ret, voted_stat_est_in_year };
  };

const declare_in_year_voted_breakdown_panel = () =>
  declare_panel({
    panel_key: "in_year_voted_breakdown",
    subject_types: ["gov"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["orgVoteStatEstimates"],
      get_dataset_keys: () => ["tabled_estimates"],
      get_title: () => text_maker("in_year_voted_breakdown_title"),
      calculate: planned_vote_or_stat_calculate("voted"),
      render: planned_vote_or_stat_render("voted"),
    }),
  });
const declare_in_year_stat_breakdown_panel = () =>
  declare_panel({
    panel_key: "in_year_stat_breakdown",
    subject_types: ["gov"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["orgVoteStatEstimates"],
      get_dataset_keys: () => ["tabled_estimates"],
      get_title: () => text_maker("in_year_stat_breakdown_title"),
      calculate: planned_vote_or_stat_calculate("stat"),
      render: planned_vote_or_stat_render("stat"),
    }),
  });

export {
  declare_in_year_voted_breakdown_panel,
  declare_in_year_stat_breakdown_panel,
};
