import { Fragment } from 'react';
import text from './auth_exp_prog_spending.yaml';
import { Details } from '../../components/Details.js';
import {
  run_template,
  PanelGraph,
  years,
  declarative_charts,
  StdPanel,
  Col,
  create_text_maker_component,
  NivoResponsiveLine,
  newIBCategoryColors,
  formatter,
} from "../shared.js";

const { 
  GraphLegend,
  A11YTable,
} = declarative_charts;

const { std_years, planning_years } = years;
const { text_maker, TM } = create_text_maker_component(text);

const auth_cols = _.map(std_years, yr=>`${yr}auth`);
const exp_cols = _.map(std_years, yr=>`${yr}exp`);

const text_keys_by_level = {
  dept: "dept_auth_exp_prog_spending_body",
  gov: "gov_auth_exp_prog_spending_body",
};


const calculate = function(subject) {
  const { orgVoteStatPa, programSpending } = this.tables;

  const query_subject = subject.is("gov") ? undefined : subject;
  const qAuthExp = orgVoteStatPa.q(query_subject);
  const auth = qAuthExp.sum(auth_cols, {as_object: false});
  const exp = qAuthExp.sum(exp_cols, {as_object: false});

  const qProgSpending = programSpending.q(query_subject);
  const progSpending = subject.has_planned_spending ? qProgSpending.sum(planning_years, {as_object: false}) : null;

  return {exp, auth, progSpending};
};

class AuthExpProgSpending extends React.Component {
  constructor(props){
    super(props);
    const active_series = [ text_maker("expenditures"), text_maker("authorities") ];
    if(props.calculations.subject.has_planned_spending){
      active_series.push( text_maker("planned_spending") );
    }
    this.state = { active_series: active_series };
  }

  render(){
    const { calculations, footnotes, sources } = this.props;
    const { active_series } = this.state;
    const { info, graph_args, subject } = calculations;
    const { exp, auth, progSpending } = graph_args;

    const series_labels = [
      text_maker("expenditures"),
      text_maker("authorities"),
      subject.has_planned_spending ? text_maker("planned_spending") : null,
    ];

    const colors = d3.scaleOrdinal().range(newIBCategoryColors);
    const raw_data = _.concat(exp, auth, progSpending);
  
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
  
    const additional_info = {
      last_history_year: _.last(history_ticks),
      last_planned_year: _.last(plan_ticks),
      gap_year: gap_year,
      plan_change: info[`${subject.level}_exp_planning_year_3`] - info['dept_auth_average'],
      hist_avg_tot_pct: _.isEqual(exp, auth) ? 0 : info[`${subject.level}_hist_avg_tot_pct`],
    };
    
    let graph_content;
    if(window.is_a11y_mode){
      const historical_data = _.map(
        exp, 
        (exp_value,year_index) => ({
          label: history_ticks[year_index],
          data: [
            formatter("compact2", exp_value, {raw: true}),
            formatter("compact2", auth[year_index], {raw: true}),
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
  
      graph_content = (
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
          zip_years_and_data(history_ticks, auth),
          _.compact([
            gap_year && {
              x: gap_year,
              y: null,
            },
            ...zip_years_and_data(plan_ticks, progSpending),
          ]),
        ])
        .filter( row => !_.isNull(row[0]) && _.includes(active_series, row[0]))
        .map( ([id, data]) => ({id, data}) )
        .value();
      
      const get_auth_exp_diff = (slice_data) => Math.abs(slice_data[0].data.y - slice_data[1].data.y);
      
      const lineStyleById = {
        [series_labels[0]]: {
          stroke: colors(series_labels[0]),
          strokeWidth: 2.5,
        },
        [series_labels[1]]: {
          strokeDasharray: '56',
          stroke: colors(series_labels[1]),
          strokeWidth: 2.5,
        },
        [series_labels[2]]: {
          stroke: colors(series_labels[2]),
          strokeWidth: 2.5,
        },
      };
      
      const DashedLine = ({ lineGenerator, xScale, yScale }) => {
        return graph_data.map(({ id, data }) => {
          return (
            <path
              key={id}
              d={lineGenerator(
                data.map(d => ({
                  x: xScale(d.x),
                  y: yScale(d.y),
                }))
              )}
              fill="none"
              style={lineStyleById[id]}
            />
          );
        });
      };
  
      const nivo_default_props = {
        data: graph_data,
        raw_data: raw_data,
        colorBy: d => colors(d.id),
        magnify_glass_translateX: 80,
        magnify_glass_translateY: 70,
        tooltip: (slice, tooltip_formatter) => (
          <div style={{color: window.infobase_color_constants.textColor}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <tbody>
                { slice.data.map(
                  tooltip_item => (
                    <tr key = {tooltip_item.serie.id}>
                      <td style= {{padding: '3px 5px'}}>
                        <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.serie.color}} />
                      </td>
                      <td style={{padding: '3px 5px'}}> {tooltip_item.serie.id} </td>
                      <td style={{padding: '3px 5px'}} dangerouslySetInnerHTML={{__html: tooltip_formatter(tooltip_item.data.y)}} />
                    </tr>
                  )
                )}
                { slice.data.length > 1 ? 
                  <tr>
                    <td style= {{height: '12px', width: '12px', padding: '3px 5px'}}/>
                    <td style={{padding: '3px 5px'}}> {text_maker('difference')} </td>
                    <td
                      style={{padding: '3px 5px', color: window.infobase_color_constants.highlightColor}} 
                      dangerouslySetInnerHTML={{__html: tooltip_formatter(get_auth_exp_diff(slice.data))}}
                    />
                  </tr> :
                  null
                }
              </tbody>
            </table>
          </div>
        ),
        margin: {
          top: 10,
          right: 30,
          bottom: 40,
          left: 100,
        },
        ...(
          _.isEqual(exp, auth)
          && _.includes(active_series, text_maker("expenditures"))
          && _.includes(active_series, text_maker("authorities")
          )
        && {
          layers: ['grid', 'markers', 'areas', DashedLine, 'slices', 'dots', 'axes', 'legends'],
        }),
        ...(marker_year && _.includes(active_series, text_maker("planned_spending")) && {
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
      
      const legend_items = _.chain(series_labels)
        .map( (label) => {
          return {
            id: label,
            label: label,
            active: _.includes(active_series, label),
            color: colors(label),
          };
        })
        .filter( (legend_row) => !_.isNull(legend_row.id) )
        .value();

      graph_content = 
      <Fragment>
        <div style={{padding: '10px 25px 0px 97px'}}>
          <div className="legend-container">
            <GraphLegend
              isHorizontal
              items={legend_items}
              onClick={ id => { 
                !(
                  active_series.length === 1 &&
                  _.includes(active_series, id)
                ) && this.setState({
                  active_series: _.toggle_list(active_series, id),
                });
              }}
            />
          </div>
        </div>
        <div style={{height: 400}} aria-hidden = {true}>
          <NivoResponsiveLine
            {...nivo_default_props}
          />
        </div>
      </Fragment>;
    }
  
    return (
      <StdPanel
        containerAlign={subject.has_planned_spending ? "top" : "middle"}
        title={text_maker("auth_exp_prog_spending_title", {...info, ...additional_info})}
        {...{footnotes,sources}}
      >
        <Col size={4} isText>
          <TM k={text_keys_by_level[subject.level]} args={{...info, ...additional_info}} />
          { gap_year &&
            <div className="auth-gap-details">
              <Details
                summary_content={<TM k={"gap_explain_title"} args={{...info, ...additional_info}}/>}
                content={<TM k={`${subject.level}_gap_explain_body`} args={{...info, ...additional_info}}/>}
              />
            </div>
          }
        </Col>
        <Col size={8} isGraph>
          {graph_content}
        </Col>
      </StdPanel>
    );
  }
}

const render = function({calculations, footnotes, sources}) {
  return (
    <AuthExpProgSpending
      calculations={calculations}
      footnotes={footnotes}
      sources={sources}
    />
  );
};

new PanelGraph({
  level: "gov",
  key: "auth_exp_prog_spending",
  depends_on: ["orgVoteStatPa", "programSpending"],
  info_deps: ["orgVoteStatPa_gov_info", "programSpending_gov_info"],
  calculate,
  render,
});

new PanelGraph({
  level: "dept",
  key: "auth_exp_prog_spending",
  depends_on: ["orgVoteStatPa", "programSpending"],
  info_deps: ["orgVoteStatPa_dept_info", "programSpending_dept_info"],
  calculate,
  render,
});

