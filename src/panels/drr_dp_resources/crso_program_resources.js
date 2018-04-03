import './crso_resource_text.ib.yaml';
import {
  formats,
  text_maker,
  PanelGraph,
  years,
  declarative_charts,
  util_components,
  run_template,
  reactAdapter,
} from "../shared";

const { 
  TextMaker,
  Format,
} = util_components;

const {
  Bar,
  GraphLegend,
  A11YTable,
} = declarative_charts;

const { planning_years } = years;

function calculate(subject,info){
  if(subject.dead_so){
    return false;
  }

  const all_exp = _.sum(planning_years, col => table6.q(subject).sum(col) )
  const all_fte = _.sum(planning_years, col => table12.q(subject).sum(col) )

  if(all_exp === 0 && all_fte === 0){
    return false;
  }

  const {table6, table12} = this.tables;


  const exp_data = _.map(table6.q(subject).data, row => ({
    label : row.prgm,
    data : planning_years.map(col => row[col]),
  }));

  const fte_data = _.map(table12.q(subject).data, row => ({
    label : row.prgm,
    data : planning_years.map(col => row[col]),
  }));

  return  {
    exp_data,
    fte_data,
  }

}
  


const render_resource_type = (is_fte) => (panel,calculations) => {
  const { graph_args, subject, info } = calculations;
  
  //const colors;
  //let data;

  const { exp_data, fte_data } = graph_args;

  //use hacky side-effects to create colors for all programs, so that these colours are consitent accross the fte/$ panel
  const all_program_names = _.chain(exp_data.programs)
    .map('label')
    .concat( _.map(exp_data, 'label'))
    .uniq()
    .value();
  const colors = infobase_colors();
  _.each(all_program_names, name => colors(name))


  const text = (
    <TextMaker 
      text_key="crso_by_prog_exp_or_ftes"
      args={{
        subject,
        crso_prg_num : _.max([info.crso_fte_prg_num, info.crso_exp_prg_num]),
        crso_prg_top1 : is_fte ? info.crso_fte_prg_top1 : info.crso_exp_prg_top1,
        crso_prg_top1_amnt  : is_fte ? info.crso_fte_prg_top1_amnt : info.crso_exp_prg_top1_amnt,
        crso_prg_top2 : is_fte ? info.crso_fte_prg_top2 : info.crso_exp_prg_top2,
        crso_prg_top2_amnt :  is_fte ? info.crso_fte_prg_top2_amnt : info.crso_exp_prg_top2_amnt,
        is_fte : is_fte,
      }}
    />
  );

  const node = panel.areas().graph.node();

  reactAdapter.render(
    <PlannedProgramResources
      programs={
        _.sortBy(
          is_fte ? fte_data : exp_data,
          ({data}) => -d3.sum(data) 
        )
      }
      colors={colors}
      text={text}
      is_fte={is_fte}
    />,
    node
  );
}

class PlannedProgramResources extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      active_programs: _.chain(props.programs)
        .map('label')
        .take(3)
        .value(),
    }
  }
  render(){
    const { 
      text,
      programs,
      colors,
      is_fte,
    } = this.props;

    const ticks = _.map(planning_years, run_template);

    const { active_programs } = this.state;


    if(window.is_a11y_mode){
      return <div>
        <div className="medium_panel_text mrgn-bttm-lg">
          { text } 
        </div>
        <div>
          <A11YTable
            label_col_header={text_maker("program")}
            data_col_headers={_.map(
              ticks,
              tick => `${tick} ${is_fte ? text_maker("ftes") : text_maker("spending")}`
            )}
            data={programs.map(({data, label}) => ({
              label,
              /* eslint-disable react/jsx-key */
              data: data.map(amt => <Format type={is_fte? "big_int_real" : "compact1"} content={amt} /> ),
            }))}
          />
        </div>
      </div>;
    }

    const graph_data = _.chain(programs)
      .filter( ({label}) => _.includes(active_programs, label) )
      .map( ({label, data}) => [ label, data ])
      .fromPairs()
      .value();

    return <div>
      <div className="medium_panel_text mrgn-bttm-lg">
        { text } 
      </div>
      <div className="frow">
        <div className="fcol-md-4">
          <div 
            style={{maxHeight: "400px"}}
            className="legend-container"
          >
            <GraphLegend
              items={_.map(programs, ({label}) =>({
                label,
                id: label,
                active: _.includes(active_programs, label),
                color: colors(label),
              }))}
              onClick={id => {
                this.setState({
                  active_programs: _.toggle_list(active_programs, id),
                })
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
            formater={ 
              is_fte ? 
              formats.big_int_real_raw : 
              formats.compact1_raw
            }
            y_axis={ is_fte ? text_maker("ftes") : "($)" }
            colors={colors}
          />
        </div>
      </div>
    </div>;

  }
}


  



_.each([true,false], is_fte => {
  new PanelGraph({
    level: "crso",
    footnotes : ["PLANNED_EXP"],
    key : `crso_by_prog_${is_fte ? "fte" : "exp"}`,
    depends_on: ['table6', 'table12'],
    info_deps: ['table6_crso_info','table12_crso_info'],
    layout : {
      full: { graph: [12] },
      half: { graph: [12] },
    },
    title :`crso_by_prog_${is_fte ? "fte" : "exp" }_title`,
    calculate,
    render: render_resource_type(is_fte),
  });
});
