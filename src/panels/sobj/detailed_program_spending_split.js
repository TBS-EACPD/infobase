import './sobj-panel-text.ib.yaml';
const {
  Subject: {
    Program,
    Dept,
  },
  formats,
  text_maker,
  run_template,
  PanelGraph,
  reactAdapter,
  util_components: {
    TextMaker,
    Select,
    Format,
  },
  infograph_href_template,
  years : {std_years},
  declarative_charts: {
    Bar,
    GraphLegend,
    StackedHbarChart,
    A11YTable,
  },
  business_constants,
} = require("../shared"); 

const { sos } = business_constants;

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

      const is_tag = subject.level === "tag";
  
      const {table305, table6} = this.tables;

      const table_data = table305.q(subject).data;

      if(_.isEmpty(table_data)){
        return false;
      }

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
            label : is_tag ? `${row.prgm} (${Dept.lookup(row.dept).acronym})` : row.prgm,
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
        graph_args: {
          flat_data,
          higher_level_mapping,
          top_3_so_nums,
          table6_data,
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
        <div>
          <div>
            <DetailedProgramSplit
              flat_data={flat_data}
              arrangements={arrangements}
              top_3_so_nums={top_3_so_nums}
            />
          </div>
          <div>
            <HistoricalProgramBars
              data={_.map(table6_data, ({label,data},ix) => ({
                label,
                data,
                id: `${ix}-${label}`,  //need unique id, program names don't always work!
              }))}
            />
          </div>
        </div>,
        node
      ); 

    },
  });
});

class HistoricalProgramBars extends React.Component {
  constructor(props){
    super(props);
    const { data } = this.props;

    //start by picking the 3 largest programs that existed in pa_last_year
    const active_last_year_progs = _.chain(data)
      .sortBy(({data}) => _.last(data) || 0)
      .takeRight(3)
      .map('id')
      .value();

    this.state = {
      selected: active_last_year_progs,
    };
  }
  render(){
    const { data } = this.props;
    const ticks = std_years.map(yr => run_template(yr));
    const { selected } = this.state;

    const colors = d4.scaleOrdinal(d4.schemeCategory20);
    const graph_data = _.chain(data)
      .filter( ({id}) => _.includes(selected, id) )
      .map( ({label, data }) => [ label, data ])
      .fromPairs()
      .value();

    if(window.is_a11y_mode){
      return <div>
        <A11YTable 
          table_name={text_maker("historical_prog_title")}
          data={_.map(data, ({label, data})=>({
            label,
            /* eslint-disable react/jsx-key */
            data: data.map(amt => <Format type="compact1" content={amt} />),
          }))}
          label_col_header={text_maker("program")}
          data_col_headers={ticks}
        />
      </div>
    }

    return <div>
      <div className="results-separator" />
      <div style={{paddingBottom:'10px'}} className='center-text font-xlarge'>
        <strong><TextMaker text_key="historical_prog_title" /></strong>
      </div>
      <div className="frow">
        <div className="fcol-md-4">
          <div
            className="well legend-container"
            style={{ maxHeight: "400px" }}
          >
            <GraphLegend
              items={_.chain(data)
                .sortBy(({data}) => _.last(data) || 0 )
                .reverse()
                .map( ({ label, id }) => ({
                  label,
                  active: _.includes(selected, id),
                  id,
                  color: colors(label),
                }))
                .value()
              }
              onClick={id => {
                this.setState({
                  selected: _.toggle_list(selected, id),
                });
              }}
            />
          </div>
        </div>
        <div className="fcol-md-8">
          <Bar
            series={graph_data}
            ticks={ticks}
            stacked={true}
            margin={{ top: 20, right: 20, left: 60, bottom: 20 }}
            formater={formats.compact1_raw}
            y_axis="($)"
            colors={colors}
          />
        </div>
      </div>
    </div>;
  }
}

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

    if(window.is_a11y_mode){
      return (
        <div className="row">
          <div className="results-separator" >
            <table className="table table-striped table-bordered">
              <caption><TextMaker text_key="so_spend_by_prog" /></caption>
              <thead>
                <tr>
                  <th scope="col">
                    <TextMaker text_key="program"/>
                  </th>
                  <th scope="col">
                    <TextMaker text_key="so"/>
                  </th>
                  <th scope="col">
                    {run_template("{{pa_last_year}}")} <TextMaker text_key="expenditures" /> 
                  </th>
                </tr>
              </thead>
              <tbody>
                {_.map( flat_data, ({so_label, program, value }) => 
                  <tr key={program.id+so_label}>
                    <td> {program.name} </td>
                    <td> {so_label} </td>
                    <td> <Format type="compact1" content={value} /> </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return <div>
      <div className="results-separator" />
      <div style={{paddingBottom:'10px'}} className='center-text font-xlarge'>
        <strong><TextMaker text_key="so_spend_by_prog" /></strong>
      </div>
      <div className="frow">
        <div className="fcol-md-4">
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
        <div className="fcol-md-8">
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
      </div> 
    </div>;

  }

}
