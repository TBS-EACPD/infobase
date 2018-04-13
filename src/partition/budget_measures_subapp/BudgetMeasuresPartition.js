import './BudgetMeasuresPartition.ib.yaml';
import './BudgetMeasuresPartition.scss';

import * as Subject from '../../models/subject';

import { PartitionDiagram } from '../partition_diagram/PartitionDiagram.js';
import { formats } from '../../core/format.js';
import { text_maker, run_template } from "../../models/text";

import { budget_measures_hierarchy_factory } from './budget_measures_hierarchy_factory.js';

import * as businessConstants from '../../models/businessConstants.yaml';

const { budget_chapters } = businessConstants;

import { make_budget_link } from './budget_utils.js';

const year = run_template("{{planning_year_2}}");

const formatter = node => {
  const in_billions = node.__value__ >= 1*Math.pow(10, 9);
  const format = in_billions ? formats.compact1 : formats.compact;
  return " (" + format(node.__value__) + ")";
}

const get_level_headers = (first_column) => {
  if (first_column === "dept"){
    return {
      "1": text_maker("org"),
      "2": text_maker("budget_measure"),
    };
  } else {
    return {
      "1": text_maker("budget_measure"),
      "2": text_maker("org"),
    };
  }
}

const root_text_func = (displayed_measure_count, root_value) => text_maker("budget_measures_partition_root", {root_value, displayed_measure_count});

const popup_template = node => {
  const popup_options = {
    year,
    value: node.__value__,
    value_is_negative: node.__value__ < 0,
    value_is_zero: node.__value__ === 0,
    lang_is_en: window.lang === "en",
    parent_name: node.parent.data.name,
    is_dept: node.data.type === "dept",
    is_budget_measure: node.data.type === "budget_measure",
    level: node.data.type,
    id: node.data.id,
    name: node.data.name,
    color: node.color,
    description: !_.isUndefined(node.data.description) && !_.isEmpty(node.data.description) && node.data.description,
    chapter: !_.isUndefined(node.data.chapter_key) && budget_chapters[node.data.chapter_key].text,
    budget_link: !_.isUndefined(node.data.chapter_key) && node.data.chapter_key !== "oth" && !_.isEmpty(node.data.ref_id) && make_budget_link(node.data.chapter_key, node.data.ref_id),
    is_first_column: node.depth === 1,
    add_reference_to_parent: node.depth === 2 && node.data.type !== "net_adjust",
    focus_text: node.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
  };
  return text_maker("budget_measure_popup_template", popup_options);
}


function center_diagram(){
  if (this.refs.outer_container){
    this.refs.outer_container.style.marginLeft = ( -d3.select("main.container").node().offsetLeft + 4 ) + "px";
  }
}

const update_diagram = (diagram, props) => {
  const data = budget_measures_hierarchy_factory(props.first_column, props.filtered_chapter_keys);
  const displayed_measure_count = _.filter(Subject.BudgetMeasure.get_all(), (budgetMeasure) => {
    return _.indexOf(props.filtered_chapter_keys, budgetMeasure.chapter_key) === -1;
  }).length;
  
  diagram.configure_then_render({
    data: data,
    formatter: formatter,
    level_headers: get_level_headers(props.first_column),
    root_text_func: _.curry(root_text_func)(displayed_measure_count),
    popup_template: popup_template,
    colors: [
      "#f6ca7c",
      "#f6987c",
      "#f6857c",
      "#b388ff",
      "#8798f6",
      "#7cd0f6",
      "#b0bec5",
    ],
    background_color: "#9c9c9c",
  });
}

export class BudgetMeasuresPartition extends React.Component {
  constructor(){
    super();
    this.center_diagram = center_diagram.bind(this);
  }
  componentDidMount(){
    window.addEventListener("resize", this.center_diagram);

    this.container = d3.select(ReactDOM.findDOMNode(this.refs.container));
    this.diagram = new PartitionDiagram(this.container, {height: 700});
    update_diagram(this.diagram, this.props);
  }
  shouldComponentUpdate(nextProps){
    update_diagram(this.diagram, nextProps);
    return false;
  }
  componentWillUnmount(){
    window.removeEventListener("resize", this.center_diagram);
  } 
  render(){
    return (
      <div
        ref="outer_container"
        style={{
          marginLeft: ( -d3.select("main.container").node().offsetLeft + 4 ) + "px",
          width: "98vw",
          marginTop: "10px",
        }}
      >
        <div 
          className="budget-measure-partiton-area" 
          ref="container"
        />
      </div>
    );
  }
}