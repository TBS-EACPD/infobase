import './BudgetMeasuresPartition.ib.yaml';
import './BudgetMeasuresPartition.scss';

import { PartitionDiagram } from '../partition_diagram/PartitionDiagram.js';
import { formats } from '../../core/format.js';
import { text_maker, run_template } from "../../models/text";

import { budget_measures_hierarchy_factory } from './budget_measures_hierarchy_factory.js';

const year = run_template("{{planning_year_2}}");

const formatter = node => {
  const in_billions = node.__value__ >= 1000;
  const format = in_billions ? formats.compact1 : formats.compact;
  return " (" + format(node.__value__*1000000) + ")";
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

const root_text_func = root_value => text_maker("budget_measures_partition_root", {root_value: root_value*1000000, year});

const popup_template = node => {
  const popup_options = {
    year,
    value: node.__value__*1000000,
    value_is_negative: node.__value__ < 0,
    parent_name: node.parent.data.name,
    is_dept: node.data.type === "dept",
    level: node.data.level,
    id: node.data.level,
    name: node.data.name,
    color: node.color,
    description: !_.isUndefined(node.data.mandate) && node.data.mandate,
    first_column: node.depth === 1,
    focus_text: node.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
  };
  return text_maker("budget_measure_popup_template", popup_options);
}


function center_diagram(){
  if (this.refs.outer_container){
    this.refs.outer_container.style.marginLeft = -d3.select("main.container").node().offsetLeft+"px";
  }
}

const update_diagram = (diagram, props) => {
  diagram.configure_then_render({
    data: budget_measures_hierarchy_factory(props.first_column),
    formatter: formatter,
    level_headers: get_level_headers(props.first_column),
    root_text_func: root_text_func,
    popup_template: popup_template,
    colors: [
      d3.color("#CB6E94").brighter(0.3),
      d3.color("#E8EB7F").brighter(0.2),
      d3.color("#ECAB80").brighter(0.2),
      d3.color("#59779B").brighter(2),
      d3.color("#ABD774").brighter(0.2),
      d3.color("#87589D").brighter(2.25),
      d3.color("#529789").brighter(0.8),
      d3.color("#ECC280").brighter(0.2),
    ],
    background_color: "#fdfdfd",
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
          marginLeft: -d3.select("main.container").node().offsetLeft+"px",
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