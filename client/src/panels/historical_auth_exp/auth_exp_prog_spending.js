import text from './historical_auth_exp.yaml';
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
const { text_maker, TM } = create_text_maker_component(text);

const auth_cols = _.map(std_years, yr=>`${yr}auth`);
const exp_cols = _.map(std_years, yr=>`${yr}exp`);
const progSpending_cols = _.map(planning_years, yr=>yr);

const text_keys_by_level = {
  dept: "dept_auth_exp_prog_spending_body",
  gov: "gov_auth_exp_prog_spending_body",
};


const calculate = function(subject) {
  const { orgVoteStatPa, programSpending } = this.tables;
  let auth, exp, progSpending;

  if ( subject.is("gov") ){
    const qAuthExp = orgVoteStatPa.q();
    auth = qAuthExp.sum(auth_cols, {as_object: false});
    exp = qAuthExp.sum(exp_cols, {as_object: false});

    const qProgSpending = programSpending.q();
    progSpending = qProgSpending.sum(progSpending_cols, {as_object: false});

  } else if ( subject.is("dept") ) {
    const qAuthExp = orgVoteStatPa.q(subject);
    auth = qAuthExp.sum(auth_cols, {as_object: false});
    exp = qAuthExp.sum(exp_cols, {as_object: false});

    const qProgSpending = programSpending.q(subject);
    progSpending = qProgSpending.sum(progSpending_cols, {as_object: false});
  }
  return {exp, auth, progSpending};
};

const render = function({calculations, footnotes, sources}) {
  const { info, graph_args, subject } = calculations;
  const history_ticks = _.map(std_years, run_template);
  const plan_ticks = _.map(planning_years, run_template);
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
  const marker_year = gap_year ? gap_year : _.first(plan_ticks);
  const {exp, auth, progSpending} = graph_args;
  const colors = d3.scaleOrdinal().range(_.concat(newIBCategoryColors));
  
  const series_labels = (
    [text_maker("expenditures"), text_maker("authorities"), text_maker("planned_spending")]
  );

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
    const graph_data = _.map(series_labels, (label) => {
      return {
        id: label,
        data: [],
      };
    });
    _.forEach(exp, (exp_value,year_index) => {
      graph_data[0].data.push({
        "x": history_ticks[year_index],
        "y": exp_value,
      });
      graph_data[1].data.push({
        "x": history_ticks[year_index],
        "y": auth[year_index],
      });
    });
    if(gap_year){
      graph_data[2].data.push({
        "x": gap_year,
        "y": null,
      });
    }
    _.forEach(progSpending, (progSpending_value, year_index) => {
      graph_data[2].data.push({
        "x": plan_ticks[year_index],
        "y": progSpending_value,
      });
    });
    graph_content = 
      <div style={{height: 400}} aria-hidden = {true}>
        {
          <NivoResponsiveLine
            data={graph_data}
            colorBy={d => colors(d.id)}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            markers={[
              {
                axis: 'x',
                value: marker_year,
                lineStyle: { 
                  stroke: window.infobase_color_constants.tertiaryColor, 
                  strokeWidth: 2,
                  strokeDasharray: ("3, 3"),
                },
              },
            ]}
            margin= {{
              top: 50,
              right: 25,
              bottom: 50,
              left: 120,
            }}
            legends={[
              {
                anchor: 'bottom-left',
                direction: 'column',
                translateX: -120,
                translateY: 35,
                itemDirection: 'left-to-right',
                itemWidth: 10,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
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
            ]}
          />
        }
      </div>;
  }

  return (
    <StdPanel
      title={text_maker("auth_exp_prog_spending_title")}
      {...{footnotes,sources}}
    >
      <Col size={6} isText>
        <TM k={text_keys_by_level[subject.level]} args={info} />
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
  info_deps: ["orgVoteStatPa_gov_info"],
  calculate,
  render,
});

new PanelGraph({
  level: "dept",
  key: "auth_exp_prog_spending",
  depends_on: ["orgVoteStatPa", "programSpending"],
  info_deps: ["orgVoteStatPa_dept_info"],
  calculate,
  render,
});

