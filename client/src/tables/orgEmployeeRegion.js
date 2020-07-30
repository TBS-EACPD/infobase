import {
  stats,
  trivial_text_maker,
  Statistics,
  format,
  people_five_year_percentage_formula,
  businessConstants,
  year_templates,
} from "./table_common";

import text from "./orgEmployeeRegion.yaml";


const { formats } = format;
const { provinces } = businessConstants;
const { people_years, people_years_short_second } = year_templates;

export default {
  text,
  id: "orgEmployeeRegion",
  legacy_id: "table10",
  source: ["RPS"],
  tags: ["PEOPLE", "GEO", "FPS", "ANNUAL"],

  link: {
    en:
      "http://open.canada.ca/data/en/dataset/933f8f6e-daee-4368-a7dc-4eadc8b5ecfa",
    fr:
      "http://ouvert.canada.ca/data/fr/dataset/933f8f6e-daee-4368-a7dc-4eadc8b5ecfa",
  },

  name: {
    en: "Geographic Region",
    fr: "Région géographique",
  },

  title: {
    en: "Geographic Region",
    fr: "Région géographique",
  },

  add_cols: function () {
    this.add_col({
      type: "int",
      key: true,
      hidden: true,
      nick: "dept",
      header: "",
    });
    this.add_col({
      type: "short-str",
      key: true,
      hidden: true,
      not_for_display: true,
      nick: "region_code",
      header: "",
    });
    this.add_col({
      key: true,
      type: "short-str",
      nick: "region",
      header: {
        en: "Geographic Region",
        fr: "Région géographique",
      },
    });
    _.each(people_years, (header, ix) => {
      this.add_col({
        type: "big_int",
        nick: header,
        header: `${trivial_text_maker("fiscal_year_end")}, ${
          people_years_short_second[ix]
        }`,
        description: {
          en:
            "Corresponds to the active employee population by Geographic Region, as of March 31 " +
            people_years_short_second[ix],
          fr:
            "Correspond au personnel actif par région géographique, au 31 mars " +
            people_years_short_second[ix],
        },
      });
    });
    this.add_col({
      type: "percentage1",
      nick: "five_year_percent",
      header: trivial_text_maker("five_year_percent_header"),
      description: {
        en: trivial_text_maker("five_year_percent_description"),
        fr: trivial_text_maker("five_year_percent_description"),
      },
      formula: people_five_year_percentage_formula("region", people_years),
    });
  },

  mapper: function (row) {
    var new_value = provinces[row[1]].text;
    row.splice(2, 0, new_value);
    return row;
  },

  sort: function (mapped_rows, lang) {
    return _.sortBy(mapped_rows, function (row) {
      if (row.region === provinces.abroad.text) {
        return "Z";
      }
      if (row.region[0] === "Î") {
        return "I";
      }
      return row.region;
    });
  },

  queries: {
    gov_grouping: function () {
      return _.chain(this.table.horizontal(people_years, false))
        .map(function (years, key) {
          return [key].concat(years);
        })
        .sortBy(function (row) {
          return d3.sum(_.tail(row));
        })
        .value();
    },
    high_level_prov_split: function (year, options) {
      options = options || {};
      var lk = provinces,
        format = options.format || false,
        fm1 = formats["big_int"],
        fm2 = formats.percentage,
        ncr = this.lang === "en" ? "NCR" : "RCN",
        non_ncr = "Non-" + ncr,
        abroad = lk.abroad.text,
        dept_total = d3.sum(this.data, function (d) {
          return d[year];
        });
      var groups = _.groupBy(
        this.data,
        function (x) {
          if (x.region_code === "ncr") {
            return ncr;
          } else if (x.region_code === "abroad") {
            return abroad;
          } else {
            return non_ncr;
          }
        },
        this
      );
      return _.map([ncr, non_ncr, abroad], function (key) {
        var relevant_group = groups[key];
        var sub_column = _.map(relevant_group, year);
        var group_total = d3.sum(sub_column);
        if (format) {
          return [key, fm1(group_total), fm2(group_total / dept_total)];
        } else {
          return [key, group_total, group_total / dept_total];
        }
      });
    },
  },

  dimensions: [
    {
      title_key: "prov",
      filter_func: _.constant(_.property("region")),
      include_in_report_builder: true,
    },
    {
      title_key: "prov_code",
      filter_func: _.constant(_.property("region_code")),
    },
  ],
};

Statistics.create_and_register({
  id: "orgEmployeeRegion_dept_info",
  table_deps: ["orgEmployeeRegion"],
  level: "dept",
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgEmployeeRegion;
    const q = table.q(subject);
    c.dept = subject;

    var all_years = q.get_top_x(["region"].concat(people_years), Infinity, {
      zip: true,
    });
    stats.year_over_year_multi_stats_active_years(
      add,
      "head_count_region",
      all_years,
      false,
      people_years
    );
  },
});

Statistics.create_and_register({
  id: "orgEmployeeRegion_gov_info",
  table_deps: ["orgEmployeeRegion"],
  level: "gov",
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgEmployeeRegion;
    const q = table.q(subject);

    var all_years = q.gov_grouping();
    stats.year_over_year_multi_stats_active_years(
      add,
      "head_count_region",
      all_years,
      false,
      people_years
    );
  },
});
