import text from "./orgEmployeeType.yaml";

import {
  stats, 
  trivial_text_maker, 
  m, 
  Statistics,
  people_five_year_percentage_formula,
  businessConstants,
  years,
} from "./table_common";

const { tenure } = businessConstants;
const {
  people_years,
  people_years_short_second,
} = years;

export default {
  text,
  id: "orgEmployeeType",
  legacy_id: "table9",
  source: ["RPS"],
  tags: [
    "PEOPLE",
    "FPS",
  ],

  "link": {
    "en": "http://open.canada.ca/data/en/dataset/13c5b5c5-5bbb-48b1-907a-dc7c5975345d",
    "fr": "http://ouvert.canada.ca/data/fr/dataset/13c5b5c5-5bbb-48b1-907a-dc7c5975345d",
  },

  "name": { 
    "en": "Population by Employee Type",
    "fr": "Population selon le type d’employé",
  },

  "title": { 
    "en": "Population by Employee Type",
    "fr": "Population selon le type d’employé",
  },

  "add_cols": function(){
    this.add_col(
      { 
        "type": "int",
        "key": true,
        "hidden": true,
        "nick": "dept",
        "header": '',
      });
    this.add_col({
      "key": true,
      "type": "short-str",
      "nick": "employee_type",
      "header": {
        "en": "Employee Type",
        "fr": "Type d'employé",
      },
    });
    _.each(people_years, (header, ix)=>{
      this.add_col({
        "type": "big_int_real",
        "simple_default": ix === 4,
        "nick": header,
        "header": m("{{mar_31}}") + ", " + people_years_short_second[ix],
        "description": {
          "en": "Corresponds to the active employee population by Employee Type, as of March 31 " + people_years_short_second[ix],
          "fr": "Correspond à l'effectif actif par type d'employé, au 31 mars " + people_years_short_second[ix],
        },			
      });
    });
    this.add_col({
      "type": "percentage1",
      "nick": "five_year_percent",
      "header": trivial_text_maker("five_year_percent_header"),
      "description": {
        "en": trivial_text_maker("five_year_percent_description"),
        "fr": trivial_text_maker("five_year_percent_description"),
      },
      "formula": people_five_year_percentage_formula("employee_type",people_years),
    });
  },

  "mapper": function (row) {
    row.splice(1, 1, tenure[row[1]].text);
    return row;
  },

  "dimensions": [
    {
      title_key: "employee_type",
      include_in_report_builder: true,

      filter_func: function(options){
        return function(row){
          return row.employee_type;
        };
      },
    },
  ],
  "queries": {
    "gov_grouping": function() {
      return _.chain(this.table.horizontal(people_years,false))
        .map(function(years, key){
          return [key].concat(years);
        })
        .sortBy(function(row){
          return d3.sum(_.tail(row));
        })
        .value();
    },
  },
};

Statistics.create_and_register({
  id: 'orgEmployeeType_dept_info', 
  table_deps: ['orgEmployeeType'],
  level: 'dept',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgEmployeeType;
    const q = table.q(subject);
    const col = "{{ppl_last_year}}";
    c.dept = subject;
    
    const dept_last_year = q.sum(col);
    add("head_count_ppl_last_year", dept_last_year);
    add("head_count_dept_share_last_year", dept_last_year/_.reduce(table.data, (memo,d) => {return memo + d[col];}, 0));

    stats.one_year_top3(
      add,
      "emp_types",
      q.get_top_x(
        ["employee_type",col],
        {
          zip: true,
          sort_col: col,
        }
      )
    );
    const all_years = q.get_top_x(["employee_type"].concat(people_years),Infinity,{zip: true});
    stats.year_over_year_multi_stats_active_years(add,"head_count_type",all_years,false,people_years);
	
    const total_head_count_by_year = _.chain(people_years)
      .map( y => d3.sum( _.map(q.data, _.property(y) ) ) )
      .value();

    add(
      "head_count_avg", 
      d3.sum(total_head_count_by_year)/ ( _.filter(total_head_count_by_year, d => d > 0).length )
    );
	
    const first_active_year_index = _.findIndex(total_head_count_by_year, d=> d !== 0);
    const last_active_year_index = _.findLastIndex(total_head_count_by_year, d => d !== 0);
    const students = _.find(q.data, d => (d.employee_type === "Student") || (d.employee_type === "Étudiant"));

    add(
      "student_share_first_active_year", 
      (first_active_year_index !== -1) && (students !== undefined) ? 
        (students[people_years[first_active_year_index]])/(total_head_count_by_year[first_active_year_index]) :
        0
    );
    
    add(
      "student_share_last_active_year", 
      (first_active_year_index !== -1) && (students !== undefined) ?
        (students[people_years[last_active_year_index]])/(total_head_count_by_year[last_active_year_index]) :
        0
    );
  },
});

Statistics.create_and_register({
  id: 'orgEmployeeType_gov_info', 
  table_deps: ['orgEmployeeType'],
  level: 'gov',
  compute: (subject, tables, infos, add, c) => {
    const table = tables.orgEmployeeType;
    const q = table.q(subject);
    const col = "{{ppl_last_year}}";
    const yearly_total_head_counts = q.sum(people_years, {as_object: false});
    const five_year_total_head_count = d3.sum(yearly_total_head_counts);

    c.emp_types = _.uniqBy(q.get_col("employee_type"));
    add( "head_count_ppl_last_year", q.sum(col));
    add( "five_year_total_head_count", five_year_total_head_count);
    add( "head_count_avg", five_year_total_head_count/people_years.length);

    const all_years = q.gov_grouping();
    stats.year_over_year_multi_stats_active_years(add,"head_count_type",all_years, false, people_years);
    
    const students = _.find(all_years, d => (d[0] === "Student") || (d[0] === "Étudiant"));
    
    add(
      "student_share_last_year_five", 
      (students[1])/(yearly_total_head_counts[0])
    );
    
    add(
      "student_share_last_year", 
      (students[5])/(yearly_total_head_counts[4])
    );
  },
});


