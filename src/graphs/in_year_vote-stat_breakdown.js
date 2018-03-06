const {
  Subject,
  formats,
  text_maker,
  PanelGraph,
  utils : { abbrev },
  D3: {
    tbs_color,
  },
  reactAdapter,
  util_components:{
    TextMaker,
    Format,
  },
  declarative_charts: {
    CirclePack,
  },
  infograph_href_template,
} = require("./shared"); 

const main_col = "{{est_in_year}}_estimates";

const planned_vote_or_stat_render = vs => function(panel, calculations, options){
  const isVoted = vs === "voted";
  return graph_top({
    panel, 
    calculations,
    isVoted,
  });
};

const planned_vote_or_stat_calculate = vs => function(subject, info){
  const {table8} = this.tables;

  const text = text_maker(vs);
  const all_rows = _.chain(table8.voted_stat(main_col,false,false)[text])
    .sortBy(x => -x[main_col] )
    .map(d => _.pick(d,"desc",'dept',main_col) )               
    .value();

  const ret = {};
  ret.text_func =  d => {
    const val = formats.compact1(d.value);
    let text = `${d.data.desc}: ${val}`;

    if (d.data.dept){

      text = `${Subject.Dept.lookup(d.data.dept).sexy_name} -  ${text}`;
    }
    const estimated_string_size = (d.zoom_r*1.2/5) * d.zoom_r/18; 
    return abbrev(text,estimated_string_size,false);
  };
  ret.data = _.take(all_rows,10);
  if (vs === 'voted'){
    ret.data.forEach(row => row.desc = row.desc.replace(/-.+$/,""));
  }
  ret.data.push({
    desc : text_maker(`all_other_${vs}_items`),
    others : true,
    [main_col] : d4.sum(_.tail(all_rows,10), d => d[main_col]),
  });
  //options.links = [this.create_links({
  // "dimension" : "voted_stat",
  // "filter" : "voted",
  // "table" : this.table,
  // "pres_level" : "depts",
  // "cols" : "thisyearauthorities"
  //})];

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
    depends_on: ['table8'],
    info_deps: [
      'table8_gov_info',
    ],
    layout : {
      "full" : {text : 12, graph: [5,7]},
      "half" : {text : 12, graph: [12,12]},
    },

    "height" : 500,
    title :`in_year_${vs}_breakdown_title`,
    text : `in_year_${vs}_breakdown_text`,
    calculate: planned_vote_or_stat_calculate(vs),
    render: planned_vote_or_stat_render(vs),
  });
});


function graph_top({panel, calculations, isVoted}){
  const { 
    graph_args: {
      data, 
      text_func, 
    },
  } = calculations;

  //draw the table 
  const col = "{{est_in_year}}_estimates";
  const top_10_rows = _.take(data, 10);
  const complement_amt =  _.last(data)[col];
  const total_amt = d4.sum(data, _.property(col) );

  const rows= _.map(top_10_rows, obj => ({
    name: Subject.Dept.lookup(obj.dept).sexy_name,
    rpb_link: infograph_href_template(Subject.Dept.lookup(obj.dept)),
    voted_stat: obj.desc, 
    amount: obj[col],
  }));

  const packing_data = {
    name : "",
    children : _.map(data,(d,i) =>  _.extend( {id:i} ,d )),
  };
  const graph_node = panel.areas().graph.node();

  reactAdapter.render(
    <div className="row">
      <div className="col-md-5 col-sm-12">
        <TopTenTable
          rows={rows}
          complement_amt={complement_amt}
          total_amt={total_amt}
          isVoted={isVoted}
        />
      </div>
      <div className="col-md-7 col-sm-12"><div>
        <CirclePack
          {...{
            zoomable : true,
            data : packing_data,
            value_attr : main_col,
            colors: tbs_color(),
            height : 500,
            cycle_colours: true,
            invisible_grand_parent : false,
            top_font_size : 12,
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
      </div></div>
    </div>, 
    graph_node
  );
};

const TopTenTable = ({ rows, total_amt, complement_amt, isVoted }) => (
  <table 
    className="table infobase-table table-striped border table-condensed table-blue"
    style={{ fontSize: '12px', lineHeight: 1 }}
  >
    <thead>
      <tr className="table-header">
        <th scope="col"><TextMaker text_key="org" /></th>
        <th scope="col"><TextMaker text_key={ isVoted? "voted" : "stat" } /></th>
        <th scope="col"><TextMaker text_key="authorities" /></th>
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

const row_cells = ({ name, rpb_link, voted_stat, amount }) => [
  rpb_link ? (
    <td key="link" className="left-text_plain"> 
      <a href={rpb_link}>
        {name}
      </a>
    </td>
  ) : (
    <td key="name" className="left-text_plain">
      {name}
    </td>
  ),
  <td key="voted_stat" className="left-text_plain">
    {voted_stat}
  </td>,
  <td key="amount" className="right_number">
    <Format 
      type="compact1"
      content={amount} 
    />
  </td>,
]
