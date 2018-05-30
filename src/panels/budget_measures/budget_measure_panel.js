import "./budget_measure_panel.ib.yaml"
import {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  business_constants,
  years,
  reactAdapter,
  util_components,
  declarative_charts,
} from "../shared";

const {
  TextMaker,
  Select,
} = util_components;

const {
  GraphLegend,
  StackedHbarChart,
  A11YTable,
} = declarative_charts;

const text_keys = {
  gov: "gov_budget_measures_panel_text",
  dpet: "dept_budget_measures_panel_text",
};

['gov', 'dept'].forEach( level_name => new PanelGraph(
  {
    level: level_name,
    key: "budget_measures_panel",
    layout: {
      full: {text: 12, graph: 12},
      half: {text: 12, graph: 12},
    },
    requires_budget_measures: true,
    depends_on: false,
    footnotes: false,
    // TODO add a source link to budget diagram?
    title: "budget_measures_panel_title",
    text: text_keys[level_name],
  
    calculate(subject, info, options){
  
      return {};
  
    },
  
    render: budget_measure_render,
  }
));

const budget_measure_render = (panel, calculations, options) => {
  // TODO anything left to do with the data

  const node = panel.areas().graph.node();

  reactAdapter.render(
    <div>
      <div>
        <BudgetMeasureHBars
        />
      </div>
    </div>,
    node
  ); 
}

class BudgetMeasureHBars extends React.Component {
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
    }
    
    if(window.is_a11y_mode){
      return; // Build a table out of the data
    }
  
    return <div>
      <div style={{paddingBottom:'10px'}} className='center-text font-xlarge'>
        <strong><TextMaker text_key="so_spend_by_prog" /></strong>
      </div>
      <div className="frow">
        <div className="fcol-md-4" style={{ width: "100%" }}>
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
        <div className="fcol-md-8" style={{ width: "100%" }}>
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
