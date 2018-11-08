import text from './spend_rev_split.yaml';
import {
  Statistics,
  formats,
  create_text_maker_component,
  PanelGraph,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared";

const { text_maker, TM } = create_text_maker_component(text);

const { Bar } = declarative_charts;

const is_revenue = so_num => +so_num > 19;
const last_year_col = "{{pa_last_year}}";

const sum_last_year_exp = rows => (
  _.chain(rows)
    .map( row => row[last_year_col] )
    .filter( _.isNumber )
    .reduce( (acc,item)=> acc+item , 0 )
    .value()
);


//given rows of std-obj-expenditure rows,  sums it up to return gross expenditures, net expenditures and revenue
const rows_to_rev_split = rows => {
  const [neg_exp, gross_exp] = _.chain( rows)
    .filter(x => x) //TODO remove this
    .partition( row => is_revenue(row.so_num) ) 
    .map(sum_last_year_exp)
    .value();  
  const net_exp = gross_exp + neg_exp;
  if (neg_exp === 0) { return false ;}
  return { neg_exp, gross_exp, net_exp };
};


const text_keys_by_level = {
  dept: "dept_spend_rev_split_text",
  program: "program_spend_rev_split_text",
  tag: "tag_spend_rev_split_text",
};

function render({calculations, footnotes, sources}) {
  const { graph_args, info, subject } = calculations;       
  const { neg_exp, gross_exp, net_exp } = graph_args; 
  
  const series = { "": [ gross_exp, neg_exp] };
  const _ticks = [ 'gross', 'revenues' ];
  // if neg_exp is 0, then no point in showing the net bar
  if (neg_exp !== 0){
    series[""].push(net_exp);
    _ticks.push('net');
  }
  const ticks = _ticks.map(text_maker);

  let graph_content;
  if(window.is_a11y_mode){
    //all information is contained in text
    graph_content = null;
  } else {
    graph_content = (
      <Bar
        {...{
          series,
          ticks,
          add_xaxis: true,
          add_yaxis: false,
          add_labels: true,                                  
          x_axis_line: true,                                
          colors: infobase_colors(),
          formater: formats.compact1_raw,
          margin: {top: 20, right: 20, left: 60, bottom: 80},
        }}
      />
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

const key = "spend_rev_split";

new PanelGraph({
  key,
  depends_on: ["table4","table5"],
  footnotes: ["SOBJ_REV"],
  level: "dept",
  info_deps: ["table5_dept_info","table4_dept_info"],

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
});


Statistics.create_and_register({
  id: 'tag_revenue', 
  table_deps: [ 'table305'],
  level: 'tag',
  compute: (subject, tables, infos, add, c) => {
    const {table305} = tables;
    const prog_rows = table305.q(subject).data;
    const exp_rev_results = rows_to_rev_split(prog_rows)

    add({
      key: "exp_rev_gross", 
      value: exp_rev_results.gross_exp,
    });

    add({
      key: "exp_rev_neg", 
      value: exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_neg_minus", 
      value: -exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_net", 
      value: exp_rev_results.net_exp,
    });

  },

});


Statistics.create_and_register({
  id: 'program_revenue', 
  table_deps: [ 'table305'],
  level: 'program',
  compute: (subject, tables, infos, add, c) => {
    const table305 = tables.table305;
    const prog_rows = table305.programs.get(subject);
    const exp_rev_results = rows_to_rev_split(prog_rows)

    add({
      key: "exp_rev_gross", 
      value: exp_rev_results.gross_exp,
    });

    add({
      key: "exp_rev_neg", 
      value: exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_neg_minus", 
      value: -exp_rev_results.neg_exp,
    });

    add({
      key: "exp_rev_net", 
      value: exp_rev_results.net_exp,
    });

  },

});

new PanelGraph({
  key,
  depends_on: ["table305"],
  info_deps: ["program_revenue"],
  level: "program",
  calculate(subject,info,options){ 
    const {table305} = this.tables;
    const prog_rows = table305.programs.get(subject);
    const rev_split = rows_to_rev_split(prog_rows);
    if(rev_split.neg_exp === 0){
      return false;
    }
    return rev_split;
  },

  render,
});

new PanelGraph({
  key,
  depends_on: ["table305"],
  level: "tag",
  info_deps: ["tag_revenue"],
  calculate(subject,info,options){
    const {table305} = this.tables;
    const prog_rows = table305.q(subject).data;
    const rev_split = rows_to_rev_split(prog_rows);
    if(rev_split.neg_exp === 0){
      return false;
    }
    return rev_split;
  },

  render,
});


