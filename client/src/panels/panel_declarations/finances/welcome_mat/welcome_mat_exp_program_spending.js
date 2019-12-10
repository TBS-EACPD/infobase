import { Fragment } from 'react';
import MediaQuery from 'react-responsive';
import {
  run_template,
  years,
  declarative_charts,
  trivial_text_maker,
  NivoResponsiveLine,
  newIBCategoryColors,
  formatter,
  Table,
} from "../../shared.js";

const {
  A11YTable,
} = declarative_charts;

const { std_years, planning_years, current_fiscal_year } = years;
const exp_cols = _.map(std_years, yr=>`${yr}exp`);

const calculate = (type, subject) => {
  const orgVoteStatPa = Table.lookup("orgVoteStatPa");
  const programSpending = Table.lookup("programSpending");
  const query_subject = subject.is("gov") ? undefined : subject;
  const qExp = subject.is("dept") ? (type != "planned" ? orgVoteStatPa.q(query_subject) : null) : programSpending.q(query_subject);
  const exp = qExp && qExp.sum(exp_cols, {as_object: false});
  
  const qProgSpending = type != "hist" ? programSpending.q(query_subject) : null;
  const progSpending = qProgSpending && subject.has_planned_spending ? qProgSpending.sum(planning_years, {as_object: false}) : null;

  return { exp, progSpending };
};

export const format_and_get_exp_program_spending = (type, subject) => {
  const colors = d3.scaleOrdinal().range(newIBCategoryColors);
  const { exp, progSpending } = calculate(type, subject);
  const raw_data = _.concat(exp, progSpending);

  const exp_exists = exp && 0 != _.reduce(exp, (exp_sum, value) => 
    exp_sum + value, 0);
  const program_spending_exists = progSpending && 0 != _.reduce(progSpending, (progSpending_sum, value) => 
    progSpending_sum + value, 0);
  const both_exists = exp_exists && program_spending_exists;

  const series_labels = [
    exp_exists ? trivial_text_maker("expenditures") : null,
    program_spending_exists ? trivial_text_maker("planned_spending") : null,
  ];

  const history_ticks = _.map(std_years, run_template);
  const plan_ticks = _.map(planning_years, run_template);
  
  const latest_historical_year = _.chain(history_ticks)
    .last()
    .split('-')
    .first()
    .parseInt()
    .value();
  const first_planning_year = _.chain(plan_ticks)
    .first()
    .split('-')
    .first()
    .parseInt()
    .value();
  const gap_year = first_planning_year - latest_historical_year === 2 && subject.has_planned_spending ?
      run_template(current_fiscal_year) :
      null;

  const marker_year = subject.has_planned_spending ? (gap_year || _.first(plan_ticks)) : null;

  let exp_program_spending_graph;
  if(window.is_a11y_mode){
    const historical_data = _.chain(exp)
      .map((exp_value, year_index) => ({
        label: history_ticks[year_index],
        data: [
          formatter("compact1_written", exp_value, {raw: true}),
          null,
        ],
      }))
      .filter(d => d.data[0] != "0")
      .value();

    const planning_data = _.map(
      progSpending,
      (progSpending_value, year_index) => ({
        label: plan_ticks[year_index],
        data: [
          null,
          formatter("compact1_written", progSpending_value, {raw: true}),
        ],
      })
    );

    const data = _.concat(historical_data, planning_data);

    exp_program_spending_graph = (
      <A11YTable
        data_col_headers={series_labels}
        data={data}
      />
    );
  } else {
    const zip_years_and_data = (years, data) => _.chain(years)
      .map( (year, year_ix) => {
        if(data){
          return {
            x: year,
            y: data[year_ix],
          };
        }
      })
      .filter( (row) => {
        if(years===history_ticks){
          return row && row.y > 0;
        } else{
          return true;
        }
      })
      .value();
    const graph_data = _.chain(series_labels)
      .zip([
        zip_years_and_data(history_ticks, exp),
        _.compact([
          gap_year && both_exists && {
            x: gap_year,
            y: null,
          },
          ...zip_years_and_data(plan_ticks, progSpending),
        ]),
      ])
      .filter( row => !_.isNull(row[0]) )
      .map( ([id, data]) => ({id, data}) )
      .value();
      
    const shouldTickRender = (tick) => {
      if(type === "hist" || type === "hist_estimates"){
        return tick === _.first(history_ticks) || tick === _.last(history_ticks);
      } else if(type === "planned"){
        return tick === _.first(plan_ticks) || tick === _.last(plan_ticks);
      } else{
        return tick === gap_year || tick === _.first(history_ticks) || tick === _.last(plan_ticks);
      }
    };
  
    const nivo_exp_program_spending_props = {
      raw_data: raw_data,
      data: graph_data,
      colorBy: d => colors(d.id),
      enableGridY: false,
      remove_left_axis: true,
      show_yaxis_zoom: false,
      min: _.min(raw_data) * 0.9,
      max: _.max(raw_data) * 1.1,
      legends: [
        {
          anchor: 'bottom-right',
          direction: 'row',
          translateX: -80,
          translateY: 60,
          itemDirection: 'left-to-right',
          itemWidth: 2,
          itemHeight: 20,
          itemsSpacing: 160,
          itemOpacity: 0.75,
          symbolSize: 12,
        },
      ],
      margin: {
        top: 10,
        right: 40,
        bottom: 70,
        left: 40,
      },  
      ...(marker_year && both_exists && _.includes(series_labels, trivial_text_maker("planned_spending")) && {
        markers: [
          {
            axis: 'x',
            value: marker_year,
            lineStyle: { 
              stroke: window.infobase_color_constants.tertiaryColor, 
              strokeWidth: 2,
              strokeDasharray: ("3, 3"),
            },
          },
        ],
      }),
    };
    const nivo_mobile_exp_program_spending_props = {
      ...nivo_exp_program_spending_props,
      bttm_axis: { format: tick => (shouldTickRender(tick) ? tick : '') },
    };
    
    exp_program_spending_graph = (
      <Fragment>
        <MediaQuery minWidth={1199}>
          <div style={{height: 230}} aria-hidden = {true}>
            <NivoResponsiveLine
              {...nivo_exp_program_spending_props}
            />
          </div>
        </MediaQuery>
        <MediaQuery maxWidth={1198}>
          <div style={{height: 230}} aria-hidden = {true}>
            <NivoResponsiveLine
              {...nivo_mobile_exp_program_spending_props}
            />
          </div>
        </MediaQuery>
      </Fragment>
    );
  }
  return exp_program_spending_graph;
};
