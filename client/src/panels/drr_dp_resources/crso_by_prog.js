import text from './crso_by_prog.yaml';
import {
  PanelGraph,
  NivoResponsiveBar,
  years,
  declarative_charts,
  util_components,
  run_template,
  Panel,
  get_planned_fte_source_link,
  get_planned_spending_source_link,
  create_text_maker_component,
} from "../shared";

const { 
  Format,

} = util_components;

const {
  GraphLegend,
  A11YTable,
} = declarative_charts;

const { planning_years } = years;

const { text_maker, TM } = create_text_maker_component(text);

const render_resource_type = (is_fte) => ({calculations, footnotes}) => {
  const { graph_args, subject, info } = calculations;
  
  const sources = [ is_fte ? get_planned_fte_source_link(subject) : get_planned_spending_source_link(subject) ];

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
    <TM 
      k="crso_by_prog_exp_or_ftes"
      args={{
        subject,
        crso_prg_num: _.max([info.crso_fte_prg_num, info.crso_exp_prg_num]),
        crso_prg_top1: is_fte ? info.crso_fte_prg_top1 : info.crso_exp_prg_top1,
        crso_prg_top1_amnt: is_fte ? info.crso_fte_prg_top1_amnt : info.crso_exp_prg_top1_amnt,
        crso_prg_top2: is_fte ? info.crso_fte_prg_top2 : info.crso_exp_prg_top2,
        crso_prg_top2_amnt: is_fte ? info.crso_fte_prg_top2_amnt : info.crso_exp_prg_top2_amnt,
        is_fte: is_fte,
      }}
    />
  );

  return (
    <Panel
      title={text_maker(
        is_fte ? 
        "crso_by_prog_fte_title" : 
        "crso_by_prog_exp_title"
      )}
      {...{sources, footnotes}}
    >
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
      />
    </Panel>
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
    
    const keys = Object.keys(graph_data)
    const data_by_year = ticks.map((year, year_index) =>(
      _.fromPairs(_.map(graph_data, (data, label) =>(
        [label,data[year_index]])
      ))
    ))
    data_by_year.map((stacked_data, index) =>{
      stacked_data["year"] = ticks[index]
    })

    return <div>
      <div className="medium_panel_text mrgn-bttm-lg">
        { text } 
      </div>
      <div className="frow">
        <div className="fcol-md-4" style={{ width: "100%" }}>
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
              onClick={id => {!(active_programs.length === 1 && active_programs.includes(id)) &&
                this.setState({
                  active_programs: _.toggle_list(active_programs, id),
                })
              }}
            />
          </div>
        </div>
        <div className="fcol-md-8" style={{ height: '400px'}}>
          <NivoResponsiveBar
            data = {data_by_year}
            keys = {keys}
            index_by = "year"
            colorBy = { d => colors(d.id)}
            is_money = {!is_fte}
          />
        </div>
      </div>
    </div>;
  }
}


const get_calculate_func = (is_fte) => {
  return function(subject,info){
    if(subject.dead_so){
      return false;
    }
  
    const {programSpending, programFtes} = this.tables;
  
    const all_exp = _.sumBy(planning_years, col => programSpending.q(subject).sum(col) )
    const all_fte = _.sumBy(planning_years, col => programFtes.q(subject).sum(col) )
  
    const should_bail = is_fte ? all_fte === 0 : all_exp === 0;
    if (should_bail){
      return false;
    }
  
    const exp_data = _.map(
      programSpending.q(subject).data, row => ({
        label: row.prgm,
        data: planning_years.map(col => row[col]),
      })
    );
  
    const fte_data = _.map(
      programFtes.q(subject).data, row => ({
        label: row.prgm,
        data: planning_years.map(col => row[col]),
      })
    );
  
    return {
      exp_data,
      fte_data,
    };
  }
}

_.each([true,false], is_fte => {
  new PanelGraph({
    level: "crso",
    footnotes: ["PLANNED_EXP"],
    key: (
      is_fte ?
      "crso_by_prog_fte" : 
      "crso_by_prog_exp"
    ),
    depends_on: ['programSpending', 'programFtes'],
    info_deps: ['programSpending_crso_info','programFtes_crso_info'],
    calculate: get_calculate_func(is_fte),
    render: render_resource_type(is_fte),
  });
});
