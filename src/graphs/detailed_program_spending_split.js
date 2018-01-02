const {
  Subject: {
    Program,
  },
  formats,
  text_maker,
  run_template,
  PanelGraph,
  utils : {find_parent},
  D3,
  reactAdapter,
  util_components: {
    TextMaker,
    Select,
  },
  infograph_href_template,
  years : {std_years},
} = require("./shared"); 

const {
  StackedHbarChart,
  GraphLegend,
} = require('../charts/declarative_charts.js');

const { sos } = require('../models/businessConstants.js');

const text_keys = {
  dept: "dept_historical_program_spending_text", //note that we're recycling another's graph text, we'll clean this up later once we confirm we're good with this.
  tag: "tag_Progam_activity_spending_text",
};

const info_deps_by_level = {
  dept: [ "table6_dept_info" ],
  tag: [ "table6_tag_info" ],
};


['dept', 'tag'].forEach( level_name => {

  new PanelGraph({
    level: level_name,
    key: "detailed_program_spending_split",
    info_deps: info_deps_by_level[level_name],
    depends_on : ['table305', "table6"],
    layout: {
      full: {text: 12, graph: 12},
      half : {text: 12, graph: 12},
    },
    footnotes: [ 'PROG', 'SOBJ' ],
    title : "detailed_program_spending_split_title",
    text :  text_keys[level_name],
    calculate(subject,info,options){
  
      const {table305, table6} = this.tables;

      const table_data = table305.q(subject).data;

      const flat_data = _.map(table_data, row => ({
        program: Program.get_from_activity_code(row.dept, row.activity_code),
        so_num: row.so_num,
        so_label: row.so,
        value: row["{{pa_last_year}}"],
      }));

      const top_3_so_nums = _.chain(flat_data)
        .compact()
        .groupBy('so_num')
        .toPairs()
        .map( ([so_num, group]) =>  ({
          so_num : +so_num, 
          sum: d4.sum(group, _.property('value')),
        }))
        .sortBy('sum')
        .reverse()
        .map('so_num')
        .take(3)
        .value();


      if( //if there is less than 3 sobjs or if revenues is one of the top 3, bail on this graph.
        top_3_so_nums.length < 3 || 
        !_.chain(top_3_so_nums).intersection([21,22]).isEmpty() 
      ){
        return false;
      }

      //maps so_nums to new so_labels
      const higher_level_mapping = so_num => {
        if(+so_num > 19){
          return text_maker('revenues');
        } else if(_.includes(top_3_so_nums, +so_num)){
          return sos[+so_num].text;
        } else {
          return text_maker('other_sos');
        }
        
      }

      const auth_cols = _.map(std_years, yr=>yr+"auth");
      const exp_cols = _.map(std_years, yr=>yr+"exp");
      const table6_data = _.chain( table6.q(subject).data)
        .filter(row => {
          return d4.sum(auth_cols.concat(exp_cols), col=> row[col]) !== 0;
        })
        .map(row => 
          ({
            label : row.prgm ,
            data : exp_cols.map(col => row[col]),
            active : false,
          })
        )
        .sortBy(x => -d4.sum(x.data))
        .value()

      return {
        top_3_so_nums,
        flat_data,
        higher_level_mapping,
        table6_data,
      };

    },

    render(panel, calculations, options){
      const {
        info,
        graph_args: {
          flat_data,
          higher_level_mapping,
          top_3_so_nums,
        },
      } = calculations;

      const filter_to_specific_so = so_num => test_so_num => (
        test_so_num === so_num ? 
        sos[+so_num].text : 
        null
      );

      const arrangements =  [ 
        {
          label: text_maker('all'),
          id: text_maker('all'),
          mapping: so_num => higher_level_mapping(so_num),
        },
      ].concat( _.chain(flat_data)
        .map('so_num')
        .uniqBy()
        .map(so_num => ({
          id: sos[so_num].text,
          label: sos[so_num].text,
          mapping: filter_to_specific_so(so_num),
        }))
        .sortBy('label')
        .value()
      );


      const node = panel.areas().graph.node();

      reactAdapter.render(
        <DetailedProgramSplit
          flat_data={flat_data}
          arrangements={arrangements}
          top_3_so_nums={top_3_so_nums}
        />,
        node
      ); 

      const graph_area = panel.areas().graph;
  
      const graph_parent = d4.select(
        find_parent(graph_area.node(), n => d4.select(n).classed("panel-body"))
      ); 
  
      const new_row = graph_parent
        .insert("div",".panel-body > div.row")
        .classed("row",true)
        .html(text_maker("historical_prog_new_row"));
       
  
      const draw_graph = function(area, data){
        const legend_area =area.select(".x1");
        const graph_area = area.select(".x2");
        const colors = d4.scaleOrdinal(d4.schemeCategory20);
  
        area.selectAll(".x1 .d3-list, .x2 *").remove();
  
        // create the list as a dynamic graph legend
        const list = D3.create_list(legend_area.node(), data, {
          html : d => d.label,
          colors : colors,
          width : "400px",
          interactive : true,
          height : 400,
          // title : mapped_data[0].type,
          legend : true,
          ul_classes : "legend",
          multi_select : true,
        });
  
        const all_active = _.every(data,"active");
        const data_to_series_format =  all_active ?  
          _.chain(data)
            .map(function(obj){ return [obj.label,obj.data];})
            .fromPairs()
            .value() : 
          {};
  
        const graph = new D3.BAR.bar(
          graph_area.node(),
          { 
            add_xaxis : true,                                   
            x_axis_line : true,                                
            add_yaxis : true,                                  
            // add_labels : true,
            stacked: true,                               
            margin : {top: 20, right:20, left: 60, bottom: 20} ,
            formater : formats.compact1_raw,
            y_axis : "($)",
            series: data_to_series_format, 
            ticks : info.last_years,
          }
        )
  
        // hook the list dispatcher up to the graph
        list.dispatch.on("click", D3.on_legend_click(graph,colors));
        // simulate the first item on the list being selected
  
        list.dispatch.call("click","",data[0],0,list.first,list.new_lis); 
      }
      draw_graph(new_row, calculations.graph_args.table6_data)

    },
  });
});

class DetailedProgramSplit extends React.Component {
  constructor(){
    super();
    this.state = {
      selected_arrangement: text_maker('all'),
    };
  }
  
  render(){
    const {
      flat_data,
      arrangements,
      top_3_so_nums,
    } = this.props;

    const { selected_arrangement } = this.state;

    const { mapping } = _.find(arrangements, {id: selected_arrangement} );

    const colors = infobase_colors();

    let legend_items;

    if(selected_arrangement === text_maker('all')){
      legend_items = [ //the order of this array will determine the colors for each sobj.
        ... _.map(top_3_so_nums, num => sos[num].text),
        text_maker('other_sos'),
        text_maker('revenues'),
      ].map( label => ({
        active: true,
        label,
        id: label,
        color: colors(label),
      }))
      //make sure 'other standard objects' comes last 
      legend_items = _.sortBy(legend_items, ({label}) => label === text_maker('other_sos') );
    }
        
    const graph_ready_data = _.chain(flat_data)
      .groupBy(row => row.program.id)
      .map(group => {
        const prog = _.first(group).program;
        return {
          key: prog.id, 
          label: prog.name,
          href: infograph_href_template(prog),
          data: _.chain(group)
            //the mapping take so_num and produces new so_labels, 
            .map( obj => Object.assign(
              {},
              obj,
              {so_label : mapping(obj.so_num)}
            ))
            .filter('so_label') //the mapping assigns falsey values in order to throw things out.
            .groupBy('so_label')
            .map((group, label) => ({
              label,
              data: d4.sum(group, _.property('value')),
            }))
            .sortBy('data')
            .reverse()
            .value(),
        };
      })
      .value();


    return <div className="row">
      <div className="results-separator" />
      <div style={{paddingBottom:'10px'}} className='center-text font-xlarge'>
        <strong><TextMaker text_key="so_spend_by_prog" /></strong>
      </div>
      <div className="col-md-4">
        <label>
          <TextMaker text_key="filter_by_so" />
          <Select 
            selected={selected_arrangement}
            options={_.map(arrangements, ({id, label}) => ({ 
              id,
              display: label,
            }))}
            onSelect={id=> this.setState({selected_arrangement: id}) }
            style={{
              display: 'block',
              margin: '10px auto',
            }}
            className="form-control"
          />
        </label>
        { !_.isEmpty(legend_items) &&
          <div className="well legend-container">
            <GraphLegend
              items={legend_items}  
            />
          </div>
        }
      </div> 
      <div className="col-md-8">
        <div 
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <StackedHbarChart
            font_size="12px"
            bar_height={60} 
            data={graph_ready_data}
            formater={formats.compact1}
            colors={colors}
            bar_label_formater={ ({label,href}) => `<a href="${href}"> ${label} </a>` }
          />
        </div>
      </div> 
      <div className="clearfix" />
      <div className="sr-only">
        <table>
          <thead>
            <tr>
              <th scope="column">
                <TextMaker text_key="program"/>
              </th>
              <th scope="column">
                <TextMaker text_key="so"/>
              </th>
              <th scope="column">
                {run_template("{{pa_last_year}}")} <TextMaker text_key="expenditures" /> 
              </th>
            </tr>
          </thead>
          <tbody>
            {_.map( flat_data, ({so_label, program, value }) => 
              <tr key={program.id+so_label}>
                <td> {program.name} </td>
                <td> {so_label} </td>
                <td> {value} </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

  }

}
