import "./budget_measures_panel.ib.yaml";
import "../../partition/budget_measures_subapp/BudgetMeasuresRoute.ib.yaml";
import {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  reactAdapter,
  Subject,
  business_constants,
  util_components,
  declarative_charts,
} from "../shared";


const { BudgetMeasure } = Subject;
const { budget_chapters } = business_constants;

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
  dept: "dept_budget_measures_panel_text",
};

const calculate_functions = {
  gov: function(subject, info, options){
    const all_measures_with_funds_rolled_up = _.chain( BudgetMeasure.get_all() )
      .map( measure => ({
        ...measure,
        funds: _.chain(measure.funds[0])
          .keys()
          .difference(["measure_id", "org_id"])
          .map( key => [
            key,
            _.reduce(measure.funds, (total, fund_row) => total + fund_row[key], 0),
          ])
          .fromPairs()
          .value(),
      }))
      .sortBy(budget_measure => -budget_measure.fund)
      .value();

    return {data: all_measures_with_funds_rolled_up};
  },
  dept: function(subject, info, options){
    const org_id_string = subject.id.toString();

    const org_measures_with_funds_filtered = _.chain( BudgetMeasure.get_all() )
      .filter(measure => _.indexOf( measure.orgs, org_id_string ) !== -1)
      .map( measure => ({
        ...measure,
        funds: _.filter( measure.funds, funds => funds.org_id === org_id_string )[0],
      }))
      .sortBy(measure => -measure.funds.fund)
      .value();

    return {data: org_measures_with_funds_filtered};
  },
};

const budget_measure_render = function(panel, calculations, options){
  // TODO anything left to do with the data, basically the common part of the level-specific calculates prob

  const { data } = calculations;

  const node = panel.areas().graph.node();

  reactAdapter.render(
    <BudgetMeasureHBars
    />,
    node
  ); 
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
    footnotes: false,
    title: "budget_measures_panel_title",
    text: text_keys[level_name],
    // TODO add a source link to budget diagram?
    calculate: calculate_functions[level_name],
    render: budget_measure_render,
  }
));

class BudgetMeasureHBars extends React.Component {
  constructor(){
    super();
    this.state = {
      selected_filter: text_maker('all'),
    };
  }
  
  render(){
    //const filter_options = [] //TODO, filter by chapter or all, in all group by chapter otherwise give each item its own bar? May not be worth enabling for gov level
    //
    //const { selected_filter } = this.state;
    //
    //const { mapping } = _.find(arrangements, {id: selected} );
    //
    //const colors = infobase_colors();
    //
    //let legend_items;
    //
    //legend_items = [ //the order of this array will determine the colors for each sobj.
    //  ... _.map(top_3_so_nums, num => sos[num].text),
    //  text_maker('other_sos'),
    //  text_maker('revenues'),
    //].map( label => ({
    //  active: true,
    //  label,
    //  id: label,
    //  color: colors(label),
    //}));
    //
    //if(window.is_a11y_mode){
    //  return; // Build a table out of the data
    //}
    //
    //return <div>
    //  <div style={{paddingBottom:'10px'}} className='center-text font-xlarge'>
    //    <strong><TextMaker text_key="so_spend_by_prog" /></strong>
    //  </div>
    //  <div className="frow">
    //    <div className="fcol-md-4" style={{ width: "100%" }}>
    //      <label>
    //        <TextMaker text_key="filter_by_so" />
    //        <Select 
    //          selected={selected_filter}
    //          options={_.map(filter_options, ({id, label}) => ({ 
    //            id,
    //            display: label,
    //          }))}
    //          onSelect={id=> this.setState({selected_filter: id}) }
    //          style={{
    //            display: 'block',
    //            margin: '10px auto',
    //          }}
    //          className="form-control"
    //        />
    //      </label>
    //      { !_.isEmpty(legend_items) &&
    //        <div className="well legend-container">
    //          <GraphLegend
    //            items={legend_items}  
    //          />
    //        </div>
    //      }
    //    </div> 
    //    <div className="fcol-md-8" style={{ width: "100%" }}>
    //      <div 
    //        style={{
    //          maxHeight: '500px',
    //          overflowY: 'auto',
    //          overflowX: 'hidden',
    //        }}
    //      >
    //        <StackedHbarChart
    //          font_size="12px"
    //          bar_height={60} 
    //          data={graph_ready_data}
    //          formater={formats.compact1}
    //          colors={colors}
    //          bar_label_formater={ ({label,href}) => `<a href="${href}"> ${label} </a>` }
    //        />
    //      </div>
    //    </div>
    //  </div> 
    //</div>;
    return <div/>;
  }
}
