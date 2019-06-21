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
  NivoResponsiveBar,
  newIBCategoryColors,
} from "../shared";


const { 
  A11YTable,
} = declarative_charts;

const { std_years } = years;
const { Format } = util_components;

const { text_maker, TM } = create_text_maker_component(text);

const auth_cols = _.map(std_years, yr=>yr+"auth");
const exp_cols = _.map(std_years, yr=>yr+"exp");

const text_keys_by_level = {
  dept: "dept_historical_auth_exp_text",
  gov: "gov_historical_auth_exp_text",
};


const calculate = function( subject,info,options ) {
  const { orgVoteStatPa } = this.tables;
  let stacked = false;
  let auth,exp;

  if ( subject.is("gov") ){
    const q = orgVoteStatPa.q();
    auth = q.sum(auth_cols, {as_object: false});
    exp = q.sum(exp_cols, {as_object: false});
  } else if ( subject.is("dept") ) {
    const q = orgVoteStatPa.q(subject);
    auth = q.sum(auth_cols, {as_object: false});
    exp = q.sum(exp_cols, {as_object: false});
  }

  if(
    _.every(auth, (x,i)=> auth[i]-exp[i] >= 0 ) &&
    _.every(auth.concat(exp), d=> d>=0)
  ){
    auth = _.map(auth, (x,i)=> auth[i] - exp[i]);
    stacked = true;
  }
  return {exp,auth,stacked};
};


const render = function({calculations, footnotes, sources}) {
  const { info, graph_args, subject } = calculations;
  const ticks = _.map(std_years, run_template);
  const {exp,auth,stacked} = graph_args;
  
  const series_labels = (
    stacked ? 
    [text_maker("expenditures"),text_maker("unused_authorities" )] : 
    [text_maker("expenditures"),text_maker("authorities")]
  );

  let graph_content;
  if(window.is_a11y_mode){
    const data = _.zip(
      ticks,
      (
        stacked ? 
        _.zip(exp, auth) :
        _.zip(auth,exp)
      )
    ).map( ([label,data ])=>({
      label,
      /* eslint-disable react/jsx-key */
      data: data.map( amt => <Format type="compact1" content={amt} /> ),
    }));

    graph_content = (
      <A11YTable
        data_col_headers={series_labels}
        data={data}
      />
    );


  } else {
    const data_exp = exp.map(
      (exp_value,year_index) =>({
        [series_labels[0]]: stacked? exp_value : auth[year_index],
        [series_labels[1]]: stacked? auth[year_index] : exp_value,
        years: ticks[year_index],
      }));

    graph_content = 
      <div style={{height: 400}} aria-hidden = {true}>
        {
          <NivoResponsiveBar
            data = {data_exp}
            keys={series_labels}
            indexBy = "years"
            colors = {newIBCategoryColors}
            enableGridX = {false}
            margin = {{
              top: 50,
              right: 30,
              bottom: 50,
              left: 65,
            }}
            legends = {[
              {
                "translateY": -35,
                "translateX": -20,
                "dataFrom": "keys",
                "direction": "row",
                "anchor": "top",
                "itemsSpacing": 120,
                "itemWidth": 100,
                "itemHeight": 25,
                "symbolSize": 20,
                "fill": window.infobase_color_constants.textColor,
              },
            ]}
            theme={{
              axis: {
                ticks: {
                  text: { 
                    fontSize: 11.5,
                    fill: window.infobase_color_constants.textColor,
                  },
                },
              },
              legends: {
                text: {
                  fontSize: 14,
                },
              },
            }}
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
  key: "historical_auth_exp",
  info_deps: ["orgVoteStatPa_gov_info"],
  depends_on: ["orgVoteStatPa"],
  calculate,
  render,
});

new PanelGraph({
  level: "dept",
  key: "historical_auth_exp",
  depends_on: ["orgVoteStatPa"],
  info_deps: ["orgVoteStatPa_dept_info"],
  calculate,
  render,
});

