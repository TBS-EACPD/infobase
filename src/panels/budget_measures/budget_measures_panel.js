import "./budget_measures_panel.ib.yaml";
import "../../partition/budget_measures_subapp/BudgetMeasuresRoute.ib.yaml";
import {
  formats,
  text_maker,
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
  Format,
} = util_components;

const {
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
      .sortBy(budget_measure => -budget_measure.funds.fund)
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

  const { graph_args: { data } } = calculations;

  const node = panel.areas().graph.node();

  reactAdapter.render(
    <BudgetMeasureHBars data = { data } />,
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
    source: (subject) => [{
      html: text_maker("budget_measures"),
      href: "#budget-measures/" + (subject.level === "gov" ? "budget-measure" : "dept"),
    }],
    calculate: calculate_functions[level_name],
    render: budget_measure_render,
  }
));

class BudgetMeasureHBars extends React.Component {
  constructor(){
    super();
    this.state = {
      selected_filter: 'all',
    };
  }
  render(){
    const { data } = this.props;

    if(window.is_a11y_mode){
      return <div>
        <A11YTable
          table_name = { text_maker("budget_name_header") }
          data = {_.map(data, 
            (budget_measure_item) => ({
              label: budget_measure_item.name,
              data: [
                <div key = { budget_measure_item.id + "col2" } >
                  { budget_chapters[budget_measure_item.chapter_key].text }
                </div>,
                <Format 
                  key = { budget_measure_item.id + "col3" } 
                  type = "compact1" 
                  content = { budget_measure_item.funds.fund } 
                />,
              ],
            })
          )}
          label_col_header = {text_maker("budget_measure")}
          data_col_headers = {[
            text_maker("budget_chapter"),
            text_maker("budget_fund_col_header"),
          ]}
        />
      </div>;
    }

    const { selected_filter } = this.state;
    const colors = infobase_colors();

    const filter_options = _.chain(data)
      .map(budget_measure_item => budget_measure_item.chapter_key)
      .uniq()
      .map( chapter_key => ({
        name: budget_chapters[chapter_key].text,
        id: chapter_key,
      }))
      .thru( present_chapter_keys => _.concat(
        present_chapter_keys, 
        [{
          name: text_maker('all'),
          id: 'all',
        }],
      ))
      .sortBy( _.identity )
      .value();

    const graph_ready_data = _.chain(data)
      .map( budget_measure_item => ({
        key: budget_measure_item.id,
        label: budget_measure_item.name,
        data: [budget_measure_item.funds.fund],
        chapter_key: budget_measure_item.chapter_key,
        ref_id: budget_measure_item.ref_id,
      }))
      .thru( mapped_data => {
        if (selected_filter !== 'all'){
          return _.chain(mapped_data)
            .filter(item => item.chapter_key === selected_filter )
            .map( item => ({
              ...item,
              data: [item],
            }))
            .value();
        } else {
          return _.chain(mapped_data)
            .groupBy("chapter_key")
            .map( (group, key) => ({
              key,
              label: budget_chapters[key].text,
              data: group,
              chapter_key: key,
            }))
            .value();
        }
      })
      .value();

    return <div>
      <div className = "frow">
        <div className = "fcol-md-12" style = {{ width: "100%" }}>
          <div className = 'centerer'>
            <label>
              <TextMaker text_key="budget_panel_filter_by_chapter" />
              <Select 
                selected = {selected_filter}
                options = {_.map(filter_options, 
                  ({name, id}) => ({ 
                    id,
                    display: name,
                  })
                )}
                onSelect = { id => this.setState({selected_filter: id}) }
                style = {{
                  display: 'block',
                  margin: '10px auto',
                }}
                className = "form-control"
              />
            </label>
          </div>
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
              data = {graph_ready_data}
              formater = {formats.compact1}
              colors = {colors}
              bar_label_formater = { 
                ({ label, chapter_key, ref_id }) => 
                  `<a href="${BudgetMeasure.make_budget_link(chapter_key, ref_id)}">${label}</a>`
              }
            />
          </div>
        </div>
      </div> 
    </div>;
  }
}
