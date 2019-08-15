import { Table } from '../../core/TableClass.js';
import { Fragment } from 'react';
import MediaQuery from 'react-responsive';
import text from '../../common_text/common_lang.yaml';
import {
  run_template,
  years,
  declarative_charts,
  create_text_maker_component,
  NivoResponsiveLine,
  newIBCategoryColors,
  formatter,
} from "../shared.js";

const {
  A11YTable,
} = declarative_charts;

const { text_maker } = create_text_maker_component(text);
const { std_years, planning_years } = years;
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

  const series_labels = [
    exp ? text_maker("expenditures") : null,
    progSpending ? text_maker("planned_spending") : null,
  ];
  const both_exists = exp && progSpending;

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
      `${latest_historical_year+1}-${(latest_historical_year+2).toString().substring(2)}` :
      null;
  
  const marker_year = subject.has_planned_spending ? (gap_year || _.first(plan_ticks)) : null;


  let exp_program_spending_graph;
  if(window.is_a11y_mode){
    const historical_data = _.map(
      exp,
      (exp_value,year_index) => ({
        label: history_ticks[year_index],
        data: [
          formatter("compact2", exp_value, {raw: true}),
          null,
        ],
      })
    );
    
    const planning_data = _.map(
      progSpending,
      (progSpending_value, year_index) => ({
        label: plan_ticks[year_index],
        data: [
          null,
          null,
          formatter("compact2", progSpending_value, {raw: true}),
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
    const zip_years_and_data = (years, data) => _.map(
      years,
      (year, year_ix) => {
        if(data){
          return {
            x: year,
            y: data[year_ix],
          };
        }
      }
    );
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
      return tick === gap_year || tick === _.first(history_ticks) || tick === _.last(plan_ticks);
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
          translateX: -70,
          translateY: 60,
          itemDirection: 'left-to-right',
          itemWidth: 2,
          itemHeight: 20,
          itemsSpacing: 140,
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
      ...(marker_year && both_exists && _.includes(series_labels, text_maker("planned_spending")) && {
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