import './auth_exp_prog_spending.scss';
import text from './historical_auth_exp.yaml';
import text2 from '../../common_text/common_lang.yaml';
import { Details } from '../../components/Details.js';
import MediaQuery from 'react-responsive';
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
} from "../shared";


const { 
  A11YTable,
} = declarative_charts;

const { std_years, planning_years } = years;
const { text_maker, TM } = create_text_maker_component([text, text2]);

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
  const progSpending = qProgSpending.sum(planning_years, {as_object: false});

  return {exp, auth, progSpending};
};

const render = function({calculations, footnotes, sources}) {
  const { info, graph_args, subject } = calculations;
  const history_ticks = _.map(std_years, run_template);
  const plan_ticks = _.map(planning_years, run_template);
  const additional_info = {};
  const year1 = _.chain(history_ticks)
    .last()
    .split('-')
    .first()
    .parseInt()
    .value();
  const year2 = _.chain(plan_ticks)
    .first()
    .split('-')
    .first()
    .parseInt()
    .value();
  const gap_year = year2 - year1 === 2 ? `${year1+1}-${(year1+2).toString().substring(2)}` : null;
  const marker_year = gap_year || _.first(plan_ticks);
  const {exp, auth, progSpending} = graph_args;
  const colors = d3.scaleOrdinal().range(newIBCategoryColors);
  const raw_data = _.concat(exp, auth, progSpending);

  const series_labels = (
    [text_maker("expenditures"), text_maker("authorities"), text_maker("planned_spending")]
  );

  if(gap_year){
    additional_info['last_history_year'] = _.last(history_ticks);
    additional_info['last_planned_year'] = _.last(plan_ticks);
    additional_info['gap_year'] = gap_year;
  }

  let graph_content;
  if(window.is_a11y_mode){
    const data = _.map(exp, (exp_value,year_index) => {
      return {
        label: history_ticks[year_index],
        data: [formatter("compact2", exp_value, {raw: true}), formatter("compact2", auth[year_index], {raw: true}), null],
      };
    });
    _.forEach(progSpending, (progSpending_value, year_index) => {
      data.push({
        label: plan_ticks[year_index],
        data: [null, null, formatter("compact2", progSpending_value, {raw: true})],
      });
    });

    graph_content = (
      <A11YTable
        data_col_headers={series_labels}
        data={data}
      />
    );
  } else {
    const zip_years_and_data = (years, data) => _.map(
      years,
      (year, year_ix) => ({
        x: year,
        y: data[year_ix],
      })
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
      .map( ([id, data]) => ({id, data}) )
      .value();

    const nivo_default_props = {
      data: graph_data,
      raw_data: raw_data,
      colorBy: d => colors(d.id),
      magnify_glass_translateX: 80,
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
      margin: {
        top: 27,
        right: 25,
        bottom: 30,
        left: 100,
      },
      legends: [
        {
          anchor: 'top-left',
          direction: 'row',
          translateY: -30,
          itemDirection: 'left-to-right',
          itemWidth: 1,
          itemHeight: 20,
          itemsSpacing: 120,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ],
    };
    const nivo_mobile_props = _.cloneDeep(nivo_default_props);
    nivo_mobile_props.margin.top = 60;
    nivo_mobile_props.legends[0].translateY = -60;
    nivo_mobile_props.legends[0].direction = "column";
    nivo_mobile_props.legends[0].itemsSpacing = 1;

    graph_content = 
      <div style={{height: 400}} aria-hidden = {true}>
        {
          <MediaQuery minWidth={992}>
            <NivoResponsiveLine
              {...nivo_default_props}
            />
          </MediaQuery>
        }
        {
          <MediaQuery maxWidth={992}>
            <NivoResponsiveLine
              {...nivo_mobile_props}
            />
          </MediaQuery>
        }
      </div>;
  }

  return (
    <StdPanel
      containerAlign="top"
      title={text_maker("auth_exp_prog_spending_title")}
      {...{footnotes,sources}}
    >
      <Col size={6} isText>
        <TM k={text_keys_by_level[subject.level]} args={{...info, ...additional_info}} />
        {
          gap_year && 
            <div className="pagedetails">
              <div className="pagedetails__gap_explain">
                <Details
                  summary_content={<TM k={"gap_explain_title"} args={{...info, ...additional_info}}/>}
                  content={<TM k={`${subject.level}_gap_explain_body`} args={{...info, ...additional_info}}/>}
                />
              </div>
            </div>
        }
      </Col>
      <Col size={6} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
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

