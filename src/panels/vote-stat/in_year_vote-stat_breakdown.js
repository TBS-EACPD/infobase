import { text_maker, TM } from './vote-stat-text-prodiver.js';
import { Fragment } from 'react';
import { 
  Subject, 
  formats, 
  PanelGraph, 
  utils, 
  charts_index, 
  util_components, 
  declarative_charts, 
  infograph_href_template, 
  StdPanel, 
  Col,
} from '../shared';
const { text_abbrev } = utils;
const { tbs_color } = charts_index.common_charts_utils;
const { Format } = util_components;
const { CirclePack } = declarative_charts;


const main_col = "{{est_in_year}}_estimates";

const planned_vote_or_stat_render = vs => function({calculations, footnotes, sources}){
  const { info, graph_args } = calculations;
  const isVoted = vs === "voted";

  const { data, text_func } = graph_args;

  // return graph_top({
  //   panel, 
  //   calculations,
  //   isVoted,
  // });


  const col = "{{est_in_year}}_estimates";  
  const top_10_rows = _.take(data, 10);
  const complement_amt = _.last(data)[col];
  const total_amt = d3.sum(data, _.property(col) );

  const rows= _.map(top_10_rows, obj => ({
    name: Subject.Dept.lookup(obj.dept).sexy_name,
    rpb_link: infograph_href_template(Subject.Dept.lookup(obj.dept)),
    voted_stat: obj.desc, 
    amount: obj[col],
  }));

  const packing_data = {
    name: "",
    children: _.map(data,(d,i) => _.extend( {id: i} ,d )),
  };

  const show_pack = !window.is_a11y_mode;

  return (
    <StdPanel
      title={text_maker(
        isVoted ? 
        "in_year_voted_breakdown_title" :
        "in_year_stat_breakdown_title"
      )}
      {...{footnotes,sources}}
    >
      <Col isText size={12}>
        <TM
          k={
            isVoted ?
            "in_year_voted_breakdown_text" :
            "in_year_stat_breakdown_text"
          }
          args={info}
        />
      </Col>
      <Col isGraph size={5}>
        <TopTenTable
          rows={rows}
          complement_amt={complement_amt}
          total_amt={total_amt}
          isVoted={isVoted}
        />
      </Col>
      {show_pack && 
        <Col isGraph size={7}>
          <CirclePack
            {...{
              zoomable: true,
              data: packing_data,
              value_attr: main_col,
              colors: tbs_color(),
              height: 500,
              cycle_colours: true,
              invisible_grand_parent: false,
              top_font_size: 12,
              hover_text_func(d){
                let text = "";

                if (d.depth === 0){ return; }
                if (d.dept){
                  text += Subject.Dept.lookup(d.dept).sexy_name + " - ";
                }
                
                text += d.data.desc + " - " + formats.compact1(d.value);

                return text;
              },
              text_func,
            }}
          />
        </Col>
      }
    </StdPanel>
  );

};

const planned_vote_or_stat_calculate = vs => function(subject, info){
  const {orgVoteStatEstimates} = this.tables;

  const text = text_maker(vs);
  const all_rows = _.chain(orgVoteStatEstimates.voted_stat(main_col,false,false)[text])
    .sortBy(x => -x[main_col] )
    .map(d => _.pick(d,"desc",'dept',main_col) )               
    .value();

  const ret = {};
  ret.text_func = d => {
    const val = formats.compact1(d.value);
    let text = `${d.data.desc}: ${val}`;

    if (d.data.dept){

      text = `${Subject.Dept.lookup(d.data.dept).sexy_name} -  ${text}`;
    }
    const estimated_string_size = (d.zoom_r*1.2/5) * d.zoom_r/18; 
    return text_abbrev(text, estimated_string_size);
  };
  ret.data = _.take(all_rows,10);
  if (vs === 'voted'){
    //vote descriptions are of the form "<vote desc> - <vote num>"
    //lets strip out the hiphen and everything that follows
    ret.data.forEach(row => row.desc = row.desc.replace(/-.+$/,""));
  }
  ret.data.push({
    desc: text_maker(`all_other_${vs}_items`),
    others: true,
    [main_col]: d3.sum(_.tail(all_rows,10), d => d[main_col]),
  });

  return ret;
};

["voted","stat"].forEach( vs => {
  new PanelGraph({
    level: "gov",

    key: (
      vs === "voted" ?
      "in_year_voted_breakdown" :
      "in_year_stat_breakdown"
    ),

    depends_on: ['orgVoteStatEstimates'],
    info_deps: [ 'orgVoteStatEstimates_gov_info'],
    calculate: planned_vote_or_stat_calculate(vs),
    render: planned_vote_or_stat_render(vs),
  });
});


const TopTenTable = ({ rows, total_amt, complement_amt, isVoted }) => (
  <table 
    className="table infobase-table table-striped border table-condensed table-blue"
    style={{ fontSize: '12px', lineHeight: 1 }}
  >
    <thead>
      <tr className="table-header">
        <th scope="col"><TM k="org" /></th>
        <th scope="col"><TM k={ isVoted? "voted" : "stat" } /></th>
        <th scope="col"><TM k="authorities" /></th>
      </tr>
    </thead>
    <tbody>
      {_.map( rows, obj => 
        <tr key={obj.name+obj.voted_stat}>
          {row_cells(obj)}
        </tr>
      )}
      <tr key="complement">
        {
          row_cells({ 
            name: "",
            voted_stat: text_maker(
              isVoted ? 
              'all_other_voted_items' : 
              'all_other_stat_items'
            ),
            amount: complement_amt,
          })
        }
      </tr>
      <tr key="total" className="total background-blue">
        {
          row_cells({
            name: text_maker('total'),
            voted_stat: '',
            amount: total_amt,
          })
        }
      </tr>
    </tbody>
  </table>
)

const row_cells = ({ name, rpb_link, voted_stat, amount }) => 
  <Fragment>
    {rpb_link ? (
    <td className="left-text_plain"> 
      <a href={rpb_link}>
        {name}
      </a>
    </td>
  ) : (
    <td className="left-text_plain">
      {name}
    </td>
  )}
    <td className="left-text_plain">
      {voted_stat}
    </td>
    <td className="right_number">
      <Format 
        type="compact1"
        content={amount} 
      />
    </td>
  </Fragment>
