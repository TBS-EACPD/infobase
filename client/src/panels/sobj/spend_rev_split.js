import text from './spend_rev_split.yaml';
import {
  formats,
  create_text_maker_component,
  declare_panel,
  StdPanel,
  Col,
  NivoResponsiveBar,
} from "../shared";

import {
  rows_to_rev_split,
} from '../../tables/table_common.js';

const { text_maker, TM } = create_text_maker_component(text);

const text_keys_by_level = {
  dept: "dept_spend_rev_split_text",
  program: "program_spend_rev_split_text",
  tag: "tag_spend_rev_split_text",
};

function render({calculations, footnotes, sources}) {
  const { graph_args, info, subject } = calculations;       
  const { neg_exp, gross_exp, net_exp } = graph_args; 
  
  const series = [gross_exp, neg_exp];
  const _ticks = [ 'gross', 'revenues' ];

  // if neg_exp is 0, then no point in showing the net bar
  if (neg_exp !== 0){
    series.push(net_exp);
    _ticks.push('net');
  }
  

  const ticks = _ticks.map(text_maker); 
  const spend_rev_data = _.map(
    series,
    (spend_rev_value,tick_index)=>({
      title: ticks[tick_index],
      [ticks[tick_index]]: spend_rev_value,
    }));

  let graph_content;
  if(window.is_a11y_mode){
    //all information is contained in text
    graph_content = null;
  } else {
    
    graph_content = (
      <div style = {{height: '400px'}} aria-hidden = {true}>
        <NivoResponsiveBar
          data = {spend_rev_data}
          keys = {ticks}
          indexBy = "title"
          enableLabel = {true}
          isInteractive = {false}
          label_format = { d=><tspan y={-4}> {formats.compact1(d, {raw: true})} </tspan>}
          colorBy = {d => d.data[d.id] < 0 ? window.infobase_color_constants.highlightColor : window.infobase_color_constants.secondaryColor}
          enableGridX={false}
        />
      </div>
    );
      
  }

  return (
    <StdPanel
      title={text_maker("spend_rev_split_title")}
      {...{footnotes,sources}}
    >
      <Col size={5} isText>
        <TM k={text_keys_by_level[subject.level]} args={info} />
      </Col>
      <Col size={7} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
  );
}


export const declare_spend_rev_split_panel = () => declare_panel({
  panel_key: "spend_rev_split",
  levels: ["dept", "program", "tag"],
  panel_config_func: (level, panel_key) => {
    switch (level){
      case "dept":
        return {
          level,
          key: panel_key,
          depends_on: ["orgVoteStatPa","orgSobjs"],
          footnotes: ["SOBJ_REV"],
          info_deps: ["orgSobjs_dept_info","orgVoteStatPa_dept_info"],
        
          calculate(subject,info,options){
            if ( info.dept_pa_last_year_rev === 0 ){
              return false;
            }
            return { neg_exp: info.dept_pa_last_year_rev,
              gross_exp: info.dept_pa_last_year_gross_exp,
              net_exp: info.dept_exp_pa_last_year,
            };
          },
          render,
        };
      case "program":
        return {
          level,
          key: panel_key,
          depends_on: ["programSobjs"],
          info_deps: ["program_revenue"],
          calculate(subject,info,options){ 
            const {programSobjs} = this.tables;
            const prog_rows = programSobjs.programs.get(subject);
            const rev_split = rows_to_rev_split(prog_rows);
            if(rev_split.neg_exp === 0){
              return false;
            }
            return rev_split;
          },
          render,
        };
      case "tag":
        return {
          level,
          key: panel_key,
          depends_on: ["programSobjs"],
          info_deps: ["tag_revenue"],
          calculate(subject,info,options){
            const {programSobjs} = this.tables;
            const prog_rows = programSobjs.q(subject).data;
            const rev_split = rows_to_rev_split(prog_rows);
            if(rev_split.neg_exp === 0){
              return false;
            }
            return rev_split;
          },
          render,
        };
    }
  },
});