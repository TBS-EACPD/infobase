import './BudgetMeasuresPartition.scss';
import { PartitionDiagram } from '../partition_diagram/PartitionDiagram.js';
import { text_maker } from "./budget_measure_text_provider.js";
import { budget_measures_hierarchy_factory } from './budget_measures_hierarchy_factory.js';
import { ContainerEscapeHatch } from '../../util_components';
import { Subject } from '../../models/subject';
import { businessConstants } from '../../models/businessConstants.js';
import { formats } from '../../core/format.js';

const { budget_chapters } = businessConstants;
const { 
  BudgetMeasure,
  CRSO,
} = Subject;
const year = text_maker("budget_route_year");

const formatter = node => {
  const in_billions = node.__value__ >= Math.pow(10, 9);
  const format = in_billions ? formats.compact1 : formats.compact;
  return " (" + format(node.__value__) + ")";
}

const get_level_headers = (first_column, selected_value) => {
  let first_two_headers;
  if (first_column === "dept"){
    first_two_headers = {
      "1": text_maker("org"),
      "2": text_maker("budget_measure"),
    };
  } else {
    first_two_headers = {
      "1": text_maker("budget_measure"),
      "2": text_maker("org"),
    };
  }

  const additional_headers = selected_value === "allocated" ?
    { "3": text_maker("program") } :
    {};
  
  return {
    ...first_two_headers,
    ...additional_headers,
  };
}


const selected_value_specifier_by_selected_value = {
  "funding": text_maker("in_funding_for"),
  "allocated": text_maker("allocated_to"),
  "withheld": text_maker("withheld_from"),
  "remaining": text_maker("remaining_for"),
};
const budget_sourced_date_note = text_maker("budget_sourced_date_note");
const additional_root_note_by_selected_value = {
  "funding": "",
  "allocated": budget_sourced_date_note,
  "withheld": budget_sourced_date_note,
  "remaining": budget_sourced_date_note,
};
const root_text_func = (displayed_measure_count, selected_value, root_value) => {
  return text_maker(
    "budget_measures_partition_root", 
    {
      root_value, 
      displayed_measure_count,
      selected_value_specifier: selected_value_specifier_by_selected_value[selected_value],
      additional_root_note: additional_root_note_by_selected_value[selected_value],
    }
  );
}

const popup_template = node => {
  const dept_is_first_column = (node.depth === 1 && node.data.type === "dept") || 
    (node.depth === 2 && node.parent.data.type === "dept") || 
    (node.depth === 3 && node.parent.data.type === "budget_measure");

  const is_budget_measure = node.data.type === "budget_measure";

  const is_dept = node.data.type === "dept";
  
  const is_program = node.data.type === "program_allocation";

  const but_actually_a_crso = is_program && !_.isUndefined(CRSO.lookup(node.data.id));

  const level = !is_program ? 
    node.data.type :
    but_actually_a_crso ? "crso" : "program";

  const has_infographic = is_dept && node.data.id !== 9999 || is_program;

  const is_first_column = node.depth === 1;

  const dept_name = !is_program ? 
    (dept_is_first_column ? 
      is_first_column ? node.data.name : node.parent.data.name :
      !is_first_column ? node.data.name : node.parent.data.name) :
    (dept_is_first_column ? 
      node.parent.parent.data.name :
      node.parent.data.name);
  
  const measure_name = !is_program ? 
    (!dept_is_first_column ? 
      is_first_column ? node.data.name : node.parent.data.name :
      !is_first_column ? node.data.name : node.parent.data.name) :
    (!dept_is_first_column ? 
      node.parent.parent.data.name :
      node.parent.data.name);

  const program_name = is_program ? node.data.name : "";
  
  const notes = _.chain(!_.isUndefined(node.data.notes) && !_.isEmpty(node.data.notes) && node.data.notes)
    .concat([
      !_.isEmpty(node.submeasures) && text_maker("budget_measure_submeasure_note"),
    ])
    .filter()
    .value();

  const popup_options = {
    year,
    dept_is_first_column,
    is_budget_measure,
    is_dept,
    is_program,
    but_actually_a_crso,
    level,
    has_infographic,
    measure_name,
    dept_name,
    program_name,
    notes,
    is_first_column,
    selected_value_is_funding: node.value_type === "funding",
    selected_value_is_allocated: node.value_type === "allocated",
    selected_value_is_withheld: node.value_type === "withheld",
    selected_value_is_remaining: node.value_type === "remaining",
    show_sourced_date: node.value_type !== "funding",
    color: node.color,
    value: node.__value__,
    value_is_negative: node.__value__ < 0,
    value_is_zero: node.__value__ === 0,
    description: !_.isUndefined(node.data.description) && !_.isEmpty(node.data.description) && node.data.description,
    chapter: !_.isUndefined(node.data.chapter_key) && budget_chapters[node.data.chapter_key].text,
    budget_link: !_.isUndefined(node.data.chapter_key) && ( (node.data.chapter_key === "oth" && node.data.type !== "net_adjust") || !_.isEmpty(node.data.ref_id) ) && 
      BudgetMeasure.make_budget_link(node.data.chapter_key, node.data.ref_id),
    id: node.data.id,
    submeasures: node.submeasures,
    focus_text: node.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
  };
  return text_maker("budget_measure_popup_template", popup_options);
}

const data_wrapper_node_rules_to_be_curried = (is_funding_overview, node) => {
  const root_value = _.last( node.ancestors() ).value;
  node.__value__ = node.value;
  node.open = true;
  node.how_many_to_show = function(_node){
    if (_node.children.length <= 2){ return [_node.children, []]; }
    const show = [_.head(_node.children)];
    const hide = _.tail(_node.children);
    const unhide = _.filter(hide, 
      __node => {
        if ( !is_funding_overview || (is_funding_overview && __node.depth !== 2) ){
          return __node.data.type !== "net_adjust" ? 
            Math.abs(__node.value) > root_value/100 :
            false;
        } else {
          return true;
        }
      }
    );
    return [show.concat(unhide), _.difference(hide, unhide)];
  }
}

const update_diagram = (diagram, props) => {
  if (props.filter_string){
    update_with_search(diagram, props);
  } else {
    standard_update(diagram, props);
  }
}

const standard_update = (diagram, props) => {
  const data = budget_measures_hierarchy_factory(props.selected_value, props.first_column, props.filtered_chapter_keys);
  const dont_fade = [];
  const data_wrapper_node_rules = _.curry(data_wrapper_node_rules_to_be_curried)(props.selected_value === "overview");
  render_diagram(diagram, props, data, data_wrapper_node_rules, dont_fade);
}

const update_with_search = (diagram, props) => {
  const dont_fade = [];
  const search_matching = [];
    
  const search_tree = budget_measures_hierarchy_factory(props.selected_value, props.first_column, props.filtered_chapter_keys);
  const deburred_query = _.deburr(props.filter_string).toLowerCase();

  search_tree.each(node => {
    if ( !_.isNull(node.parent) ){
      if (
        _.deburr( node.data.name.toLowerCase() ) === deburred_query ||
        (node.data.type === "dept" && node.data.id !== 9999) && 
           (
             _.deburr( node.data.acronym.toLowerCase() ) === deburred_query ||
             _.deburr( node.data.fancy_acronym.toLowerCase() ) === deburred_query ||
             _.deburr( node.data.applied_title.toLowerCase() ) === deburred_query
           )
      ) {
        search_matching.push(node);
        dont_fade.push(node);
        _.each(node.children, children => {
          search_matching.push(children);
          dont_fade.push(children);
        });
      } else if (node.data.search_string.indexOf(deburred_query) !== -1){
        search_matching.push(node);
        dont_fade.push(node);
      }
    }
  });

  const to_open = _.chain(search_matching)
    .map( n => n.ancestors() )
    .flatten(true)
    .uniq()
    .value();
  const how_many_to_be_shown = node => {
    const partition = _.partition( node.children, child => _.includes(to_open, child) );
    return partition;
  };
    
  const search_data_wrapper_node_rules = (node) => {
    node.__value__ = node.value;
    node.open = true;
    node.how_many_to_show = how_many_to_be_shown;
  }

  render_diagram(diagram, props, search_tree, search_data_wrapper_node_rules, dont_fade);
}

const render_diagram = (diagram, props, data, data_wrapper_node_rules, dont_fade) => {
  const displayed_measure_count = _.filter(BudgetMeasure.get_all(), measure => {
    const measure_is_filtered_out_for_chapter = _.indexOf(props.filtered_chapter_keys, measure.chapter_key) !== -1;
    const measure_is_filtered_out_for_value = props.selected_value !== "funding" && !_.some(measure.data, (row) => row[props.selected_value] !== 0);
    return !measure_is_filtered_out_for_chapter && !measure_is_filtered_out_for_value;
  }).length;

  diagram.configure_then_render({
    data,
    formatter,
    level_headers: get_level_headers(props.first_column, props.selected_value),
    root_text_func: _.curry(root_text_func)(displayed_measure_count, props.selected_value),
    popup_template,
    data_wrapper_node_rules,
    dont_fade,
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
  componentDidMount(){
    this.container = d3.select( ReactDOM.findDOMNode(this.refs.container) );
    this.diagram = new PartitionDiagram(this.container, {height: 700});
    update_diagram(this.diagram, this.props);
  }
  shouldComponentUpdate(nextProps){
    update_diagram(this.diagram, nextProps);
    return false;
  }
  render(){
    return (
      <ContainerEscapeHatch>
        <div 
          className="budget-measure-partiton-area" 
          ref="container"
        />
      </ContainerEscapeHatch>
    );
  }
}