import { Fragment } from 'react';
import text from './auth_exp_planned_spending.yaml';
import {
  run_template,
  year_templates,
  actual_to_planned_gap_year,
  declarative_charts,
  StdPanel,
  Col,
  create_text_maker_component,
  NivoResponsiveLine,
  newIBCategoryColors,
  util_components,

  declare_panel,
} from "../../shared.js";

const { 
  GraphLegend,
  A11YTable,
} = declarative_charts;
const { Details } = util_components;

const { std_years, planning_years, estimates_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);

const auth_cols = _.map(std_years, yr => `${yr}auth`);
const exp_cols = _.map(std_years, yr => `${yr}exp`);

const text_keys_by_level = {
  dept: "dept_auth_exp_planned_spending_body",
  gov: "gov_auth_exp_planned_spending_body",
};


const AuthExpPlannedSpendingTable = ({data_series}) => {
  const series_labels = _.map(data_series, 'label');

  const all_years = _.chain(data_series)
    .flatMap('years')
    .uniq()
    .value();
  
  const data = _.map(
    all_years,
    (year) => ({
      label: year,
      data: _.map(
        data_series,
        ({years, values}) => {
          const current_year_index = _.indexOf(years, year);
          return current_year_index === -1 ? null : values[current_year_index];
        }
      ),
    })
  );
  
  return (
    <A11YTable
      data_col_headers={series_labels}
      data={data}
    />
  );
};
  
//class AuthExpPlannedSpendingGraph extends React.Component {
//  constructor(props){
//    super(props);
//
//    const data_series = _.chain([
//      "budgetary_expenditures",
//      "authorities",
//      props.calculations.subject.has_planned_spending && "planned_spending",
//    ])
//      .compact()
//      .map(
//        (series_key) => ({
//          series_key,
//          label: text_maker(series_key),
//          active: true,
//        })
//      )
//      .value();
//
//    this.state = { data_series };
//  }
//  render(){
//    const {
//      exp_values,
//      auth_values,
//      planned_spending_values,
//      gap_year,
//    } = this.props;
//    const { data_series } = this.state;
//
//    const colors = d3.scaleOrdinal().range(newIBCategoryColors);
//    const raw_data = _.concat(exp_values, auth_values, planned_spending_values);
//    
//    const zip_years_and_data = (years, data) => _.map(
//      years,
//      (year, year_ix) => {
//        if(data){
//          return {
//            x: year,
//            y: data[year_ix],
//          };
//        }
//      }
//    );
//    const graph_data = _.chain(series_labels)
//      .zip([
//        zip_years_and_data(exp_ticks, exp_values),
//        zip_years_and_data(auth_ticks, auth_values),
//        _.compact([
//          gap_year && {
//            x: gap_year,
//            y: null,
//          },
//          ...zip_years_and_data(plan_ticks, planned_spending_values),
//        ]),
//      ])
//      .filter( row => !_.isNull(row[0]) && _.includes(active_series, row[0]))
//      .map( ([id, data]) => ({id, data}) )
//      .value();
//    
//    const get_auth_exp_diff = (slice_data) => Math.abs(slice_data[0].data.y - slice_data[1].data.y);
//    
//    const lineStyleById = {
//      [series_labels[0]]: {
//        stroke: colors(series_labels[0]),
//        strokeWidth: 2.5,
//      },
//      [series_labels[1]]: {
//        strokeDasharray: '56',
//        stroke: colors(series_labels[1]),
//        strokeWidth: 2.5,
//      },
//      [series_labels[2]]: {
//        stroke: colors(series_labels[2]),
//        strokeWidth: 2.5,
//      },
//    };
//    
//    const DashedLine = ({ lineGenerator, xScale, yScale }) => {
//      return graph_data.map(({ id, data }) => {
//        return (
//          <path
//            key={id}
//            d={lineGenerator(
//              data.map(d => ({
//                x: xScale(d.x),
//                y: d.y != null ? yScale(d.y) : null,
//              }))
//            )}
//            fill="none"
//            style={lineStyleById[id]}
//          />
//        );
//      });
//    };
//  
//    const nivo_default_props = {
//      data: graph_data,
//      raw_data: raw_data,
//      colorBy: d => colors(d.id),
//      magnify_glass_translateX: 80,
//      magnify_glass_translateY: 70,
//      tooltip: (slice, tooltip_formatter) => (
//        <div style={{color: window.infobase_color_constants.textColor}}>
//          <table style={{width: '100%', borderCollapse: 'collapse'}}>
//            <tbody>
//              { slice.data.map(
//                tooltip_item => (
//                  <tr key = {tooltip_item.serie.id}>
//                    <td style= {{padding: '3px 5px'}}>
//                      <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.serie.color}} />
//                    </td>
//                    <td style={{padding: '3px 5px'}}> {tooltip_item.serie.id} </td>
//                    <td style={{padding: '3px 5px'}} dangerouslySetInnerHTML={{__html: tooltip_formatter(tooltip_item.data.y)}} />
//                  </tr>
//                )
//              )}
//              { slice.data.length > 1 ? 
//                <tr>
//                  <td style= {{height: '12px', width: '12px', padding: '3px 5px'}}/>
//                  <td style={{padding: '3px 5px'}}> {text_maker('difference')} </td>
//                  <td
//                    style={{padding: '3px 5px', color: window.infobase_color_constants.highlightColor}} 
//                    dangerouslySetInnerHTML={{__html: tooltip_formatter(get_auth_exp_diff(slice.data))}}
//                  />
//                </tr> :
//                null
//              }
//            </tbody>
//          </table>
//        </div>
//      ),
//      margin: {
//        top: 10,
//        right: 30,
//        bottom: 40,
//        left: 100,
//      },
//      ...(
//        _.isEqual(exp_values, auth_values)
//        && _.includes(active_series, text_maker("budgetary_expenditures"))
//        && _.includes(active_series, text_maker("authorities")
//        )
//      && {
//        layers: ['grid', 'markers', 'areas', DashedLine, 'slices', 'dots', 'axes', 'legends'],
//      }),
//      ...(gap_year && _.includes(active_series, text_maker("planned_spending")) && {
//        markers: [
//          {
//            axis: 'x',
//            value: gap_year,
//            lineStyle: {
//              stroke: window.infobase_color_constants.tertiaryColor, 
//              strokeWidth: 2,
//              strokeDasharray: ("3, 3"),
//            },  
//          },
//        ], 
//      }),
//    };
//    
//    const legend_items = _.chain(series_labels)
//      .map( (label) => {
//        return {
//          id: label,
//          label: label,
//          active: _.includes(active_series, label),
//          color: colors(label),
//        };
//      })
//      .filter( (legend_row) => !_.isNull(legend_row.id) )
//      .value();
//  
//    return (
//      <Fragment>
//        <div style={{padding: '10px 25px 0px 97px'}}>
//          <div className="legend-container">
//            <GraphLegend
//              isHorizontal
//              items={legend_items}
//              onClick={ id => { 
//                !(
//                  active_series.length === 1 &&
//                  _.includes(active_series, id)
//                ) && this.setState({
//                  active_series: _.toggle_list(active_series, id),
//                });
//              }}
//            />
//          </div>
//        </div>
//        <div style={{height: 400}} aria-hidden = {true}>
//          <NivoResponsiveLine
//            {...nivo_default_props}
//          />
//        </div>
//      </Fragment>
//    );
//  }
//}


const render = function({calculations, footnotes, sources, glossary_keys}) {
  const { info, panel_args, subject } = calculations;
  const { data_series, additional_info } = panel_args;

  const final_info = {...info, ...additional_info};

  return (
    <StdPanel
      containerAlign={subject.has_planned_spending ? "top" : "middle"}
      title={text_maker("auth_exp_planned_spending_title", final_info)}
      {...{footnotes, sources, glossary_keys}}
    >
      <Col size={4} isText>
        <TM k={text_keys_by_level[subject.level]} args={final_info} />
        { additional_info.gap_year &&
          <div className="auth-gap-details">
            <Details
              summary_content={<TM k={"gap_explain_title"} args={final_info}/>}
              content={<TM k={`${subject.level}_gap_explain_body`} args={final_info}/>}
            />
          </div>
        }
      </Col>
      <Col size={8} isGraph>
          <AuthExpPlannedSpendingTable
            data_series={data_series}
          />
      </Col>
    </StdPanel>
  );
};


const calculate = function(subject, info, options) {
  const { orgVoteStatPa, programSpending, orgVoteStatEstimates } = this.tables;

  const query_subject = subject.is("gov") ? undefined : subject;
  

  const exp_values = orgVoteStatPa.q(query_subject).sum(exp_cols, {as_object: false});


  const history_years_written = _.map(std_years, run_template);
  const future_auth_year_templates = _.takeRightWhile(
    estimates_years,
    (est_year) => !_.includes( history_years_written, run_template(est_year) )
  );

  const historical_auth_values = orgVoteStatPa.q(query_subject).sum(auth_cols, {as_object: false});
  const future_auth_values = _.map(
    future_auth_year_templates,
    (future_auth_year_template) => orgVoteStatEstimates.q(query_subject).sum(`${future_auth_year_template}_estimates`, {as_object: false})
  );

  const auth_values = _.concat(historical_auth_values, future_auth_values);


  const planned_spending_values = programSpending.q(query_subject).sum(planning_years, {as_object: false});


  const data_series = _.chain([
    {
      key: "budgetary_expenditures",
      year_templates: std_years,
      values: exp_values,
    },
    {
      key: "authorities",
      year_templates: _.concat(std_years, future_auth_year_templates),
      values: auth_values,
    },
    subject.has_planned_spending && {
      key: "planned_spending",
      year_templates: planning_years,
      values: planned_spending_values,
    },
  ])
    .compact()
    .map(
      (series) => ({
        ...series,
        years: _.map(series.year_templates, run_template),
        label: text_maker(series.key),
      })
    )
    .value();


  const additional_info = {
    last_history_year: run_template( _.last(std_years) ),
    last_planned_year: run_template( _.last(planning_years) ),
    gap_year: (subject.has_planned_spending && actual_to_planned_gap_year) || null,
    plan_change: info[`${subject.level}_exp_planning_year_3`] - info[`${subject.level}_auth_average`],
    hist_avg_tot_pct: _.isEqual(exp_values, auth_values) ? 0 : info[`${subject.level}_hist_avg_tot_pct`],
    last_year_lapse_amt: info[`${subject.level}_auth_pa_last_year`] - info[`${subject.level}_exp_pa_last_year`] || 0,
    last_year_lapse_pct: (info[`${subject.level}_auth_pa_last_year`] - info[`${subject.level}_exp_pa_last_year`] || 0)/info[`${subject.level}_auth_pa_last_year`],
  };

  return {data_series, additional_info};
};


export const declare_auth_exp_planned_spending_panel = () => declare_panel({
  panel_key: "auth_exp_planned_spending",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ["orgVoteStatPa", "programSpending", "orgVoteStatEstimates"],
    info_deps: [`orgVoteStatPa_${level}_info`, `programSpending_${level}_info`],
    glossary_keys: ["BUD_EXP", "NB_EXP"],
    calculate,
    render,
  }),
});
