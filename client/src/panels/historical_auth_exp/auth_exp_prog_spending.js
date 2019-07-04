import text from './historical_auth_exp.yaml';
import {
  run_template,
  PanelGraph,
  years,
  util_components,
  declarative_charts,
  StdPanel,
  Col,
  create_text_maker_component,
  NivoResponsiveLine,
  newIBCategoryColors,
} from "../shared";


const { 
  A11YTable,
} = declarative_charts;

const { std_years, planning_years } = years;
const { Format } = util_components;

const { text_maker, TM } = create_text_maker_component(text);

const auth_cols = _.map(std_years, yr=>`${yr}auth`);
const exp_cols = _.map(std_years, yr=>`${yr}exp`);
const progSpending_cols = _.map(planning_years, yr=>`${yr}_gross`);

const text_keys_by_level = {
  dept: "dept_historical_auth_exp_text",
  gov: "gov_historical_auth_exp_text",
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
  const year1 = _.parseInt((_.first(_.split(_.last(history_ticks), '-'))));
  const year2 = _.parseInt((_.first(_.split(_.first(plan_ticks), '-'))));
  const {exp, auth, progSpending} = graph_args;
  const colors = d3.scaleOrdinal().range(_.concat(newIBCategoryColors));
  
  const series_labels = (
    [text_maker("expenditures"), text_maker("authorities"), text_maker("planned_spending")]
  );

  let graph_content;
  if(window.is_a11y_mode){
    /*
    const data = _.zip(
      history_ticks,
      (
        stacked ? 
        _.zip(exp, auth) :
        _.zip(auth,exp)
      )
    ).map( ([label,data ])=>({
      label,
      /* eslint-disable react/jsx-key 
      data: data.map( amt => <Format type="compact1" content={amt} /> ),
    }));

    graph_content = (
      <A11YTable
        data_col_headers={series_labels}
        data={data}
      />
    );*/


  } else {
    const graph_data = _.map(series_labels, (label) => {
      return {
        id: label,
        data: [],
      };
    }
    );
    exp.map((exp_value,year_index) => {
      graph_data[0].data.push({
        "x": history_ticks[year_index],
        "y": exp_value,
      });
      graph_data[1].data.push({
        "x": history_ticks[year_index],
        "y": auth[year_index],
      });
    });
    if(year2 - year1 == 2){
      graph_data[2].data.push({
        "x": `${year1+1}-${(year1+2).toString().substring(2)}`,
        "y": null,
      });
    }
    progSpending.map((progSpending_value, year_index) => {
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
                value: "2018-19",
                lineStyle: { stroke: '#b0413e', strokeWidth: 2 },
                //legend: 'x marker',
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
      title={text_maker("historical_auth_exp_title")}
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

