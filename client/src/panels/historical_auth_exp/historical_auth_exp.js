import text from './historical_auth_exp.yaml';
import { ResponsiveBar } from '../../../src/nivo-bar.js';

import {
  formats,
  run_template,
  PanelGraph,
  years,
  util_components,
  declarative_charts,
  StdPanel,
  Col,
  create_text_maker_component,
} from "../shared";

const { 
  // GraphLegend,
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
    [text_maker("authorities"),text_maker("expenditures")]
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

    let keys = ["Expenditures","Unused Authorities"];
    let dataExp = exp.map((d,i) =>{
      const value = d;
      const value2 = auth[i];
      let result = {};
      result[keys[0]]=value;
      result[keys[1]]=value2;
      result["years"]=`${2013+i}-${14+i}`;
      return result;
    });


    // const colors = infobase_colors();
    graph_content = <div>
      <div style={{height: 400}}>
        {
          <ResponsiveBar
            data={dataExp}
            keys={keys}
            indexBy="years"
            margin={{
              "top": 50,
              "right": 55,
              "bottom": 40,
              "left": 65,
            }}
            padding={0.3}
            colors="paired"
            axisTop={null}
            maxValue={`${_.max(exp)*1.1}`}
            axisRight={null}
            axisBottom={{
              "tickSize": 5,
              "tickPadding": 5,
              "tickRotation": -15,
              "legendPosition": "middle",
              "legendOffset": 32,

            }}
            axisLeft={
              {
                "tickValues": 6,
                "format": d => formats.compact1(d,{raw: true})}
            }
            label={null}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="inherit:darker(1.6)"
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            tooltipFormat={d=> `$${formats.big_int_real(d, {raw: true})}`}
            legends={[
              {
                
                "dataFrom": "keys",
                "direction": "row",
                "anchor": "top",
                "justify": false,
                "itemsSpacing": 0,
                "itemWidth": 100,
                "itemHeight": -55,
                "itemOpacity": 0.75,
                "symbolSize": 20,
                "effects": [
                  {
                    "on": "hover",
                    "style": {
                      "itemOpacity": 1,
                    },
                  },
                ],
              },
            ]}
          />}
      </div>
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

