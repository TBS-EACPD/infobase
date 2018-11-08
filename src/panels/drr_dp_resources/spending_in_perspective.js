import text from './perspective_text.yaml';
import {
  PanelGraph, 
  formats,
  sum_a_tag_col,
  util_components,
  declarative_charts,
  Panel,
  create_text_maker_component,
} from "../shared";

const {
  SafePie,
  TabularPercentLegend,
} = declarative_charts;

const { 
  Select,
  Format,
} = util_components;

const { text_maker, TM } = create_text_maker_component(text);

const col = "{{planning_year_1}}";


class SpendInTagPerspective extends React.Component {
  constructor(){
    super();
    this.state = {
      active_tag_index: 0,
    };
  }
  render(){
    const {
      tag_exps,
      subject,
      prog_exp,
      
    } = this.props;
    
    const { active_tag_index } = this.state;
    
    const { tag: active_tag, amount: active_tag_exp } = tag_exps[active_tag_index];
    

    const color_scale = infobase_colors();

    const data = [
      {
        label: subject.sexy_name, 
        value: prog_exp,
      },
      {
        label: text_maker('other'), 
        value: active_tag_exp - prog_exp,
      },
    ];

    const has_neg = _.chain(data).map('value').min().value() < 0;

    const legend_display = (!has_neg && 
      <TabularPercentLegend
        items={
          _.map(data, obj => ({...obj,
            color: color_scale(obj.label),
            id: obj.label,
          }))
        }
        get_right_content={item =>  
          <div style={{width: "120px", display: "flex"}}>
            <div style={{width: "60px"}}>
              <Format type="compact1" content={item.value} />  
            </div>
            <div style={{width: "60px"}}>
              (<Format type="percentage1" content={item.value*Math.pow(active_tag_exp,-1)} />)
            </div>
          </div>
        }
      />
    );

    return (
      <div className="grid-row">
        <div 
          className="lg-grid-panel50" 
          style={{ padding: "10px", marginBottom: 'auto', marginTop: 'auto'}}
        >
          <div className="medium_panel_text">
            <TM
              k="program_spending_in_tag_perspective_text"
              args={{
                subject,
                tag: active_tag,
                tag_spend: active_tag_exp,
                tag_exp_pct: prog_exp / active_tag_exp,
              }}
            />
          </div>
        </div>
        <div 
          className="lg-grid-panel50"
          style={{
            padding: "10px",
            flexDirection: "column",
          }} 
        >
          {tag_exps.length > 1 && 
            <div>
              <Select 
                options={_.map(
                  tag_exps,  
                  ({tag}, index) => ({
                    id: index,
                    display: tag.name,
                  })
                )}
                onSelect={id=> {
                  this.setState({active_tag_index: id}) 
                }}
                selected={active_tag_index}
                className="form-control"
                style={{width: "100%"}}
              />
            </div>
          }
          <SafePie
            data={data}
            color={color_scale}
            font_size={14}
            showLabels={false}
            pct_formatter={formats.percentage1}
            inner_radius={true}
            inner_text={true}
            inner_text_fmt={formats.compact1_raw}
          />
          {legend_display}
        </div>

      </div>
    );
  }
}

//spending in tag perspective also included
new PanelGraph({
  level: "program",
  key: "spending_in_tag_perspective",
  depends_on: ['table6'],
  info_deps: ["table6_program_info"],
  calculate(subject,info,options){
    if(window.is_a11y_mode){
      //turn off this panel in a11y mode
      return false;
    }
    if(subject.dead_program){
      return false;
    }
    const {table6} = this.tables;
    //analysis: as of writing this (oct 2016) the max number of tags encountered is 13.
    const prog_row = _.first(table6.programs.get(subject));

    if(!(prog_row[col] > 0)){
      return false;
    }
    const tags = subject.tags;

    const tag_exps = _.map(tags,tag => ({ 
      tag,
      amount: sum_a_tag_col(tag, table6, col),
    }));
    return { tag_exps };
  },

  render({calculations, footnotes, sources}){
    const { graph_args, subject, info } = calculations;

    const { tag_exps } = graph_args;
    const prog_exp = info.program_exp_planning_year_1;

    return (
      <Panel
        title={text_maker("program_spending_in_tag_perspective_title")}
        {...{footnotes, sources}}
      >
        <SpendInTagPerspective
          tag_exps={tag_exps}
          subject={subject}
          prog_exp={prog_exp} 
        />
      </Panel>
    );
    
  },
});
