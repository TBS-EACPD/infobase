import "./BudgetMeasuresPartition.scss";
import { PartitionDiagram } from "../partition_diagram/PartitionDiagram.js";
import { text_maker } from "./budget_measure_text_provider.js";
import { budget_measures_hierarchy_factory } from "./budget_measures_hierarchy_factory.js";
import { ContainerEscapeHatch } from "../../components/index.js";
import { Subject } from "../../models/subject";
import { businessConstants } from "../../models/businessConstants.js";
import { formats } from "../../core/format.js";
import { sanitized_marked } from "../../general_utils.js";
import { newIBLightCategoryColors } from "../../core/color_schemes.js";
import * as color_defs from "../../core/color_defs.js";

const { budget_chapters } = businessConstants;
const { BudgetMeasure, CRSO } = Subject;

const { budget_data_source_dates } = BudgetMeasure;

const formatter = (node) => {
  const in_billions = node.__value__ >= Math.pow(10, 9);
  const format = in_billions ? formats.compact1 : formats.compact;
  return " (" + format(node.__value__) + ")";
};

const get_level_headers = (first_column, selected_value) => {
  if (selected_value === "overview") {
    return {
      "1": text_maker("budget_measure"),
      "2": text_maker("funding_decisions_header"),
      "3": text_maker("program_allocations"),
    };
  }

  let first_two_headers;
  if (first_column === "dept") {
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

  const additional_headers =
    selected_value === "allocated" ? { "3": text_maker("program") } : {};

  return {
    ...first_two_headers,
    ...additional_headers,
  };
};

const selected_value_specifier_by_selected_value = {
  overview: text_maker("in_funding_for"),
  funding: text_maker("in_funding_for"),
  allocated: text_maker("allocated_to"),
  withheld: text_maker("withheld_from"),
  remaining: text_maker("remaining_for"),
};
const get_additional_root_note = (selected_value, year_value) => {
  if (_.includes(["allocated", "withheld", "remaining"], selected_value)) {
    return text_maker("budget_sourced_date_note", {
      budget_data_source_date: budget_data_source_dates[year_value],
    });
  } else {
    return "";
  }
};
const root_text_func = (
  displayed_measure_count,
  selected_value,
  year_value,
  root_value
) => {
  return text_maker("budget_measures_partition_root", {
    root_value,
    displayed_measure_count,
    budget_year: year_value,
    selected_value_specifier:
      selected_value_specifier_by_selected_value[selected_value],
    additional_root_note: get_additional_root_note(selected_value, year_value),
  });
};

const popup_template = (year_value, node) => {
  const dept_is_first_column =
    (node.depth === 1 && node.data.type === "dept") ||
    (node.depth === 2 && node.parent.data.type === "dept") ||
    (node.depth === 3 && node.parent.data.type === "budget_measure");

  const is_budget_measure = node.data.type === "budget_measure";

  const is_dept = node.data.type === "dept";

  const is_program = node.data.type === "program_allocation";

  const but_actually_a_crso =
    is_program && !_.isUndefined(CRSO.lookup(node.data.id));

  const level = !is_program
    ? node.data.type
    : but_actually_a_crso
    ? "crso"
    : "program";

  const has_infographic =
    (is_dept && node.data.id !== 9999) || (is_program && !node.data.no_link);

  const is_first_column = node.depth === 1;

  const dept_name = !is_program
    ? dept_is_first_column
      ? is_first_column
        ? node.data.name
        : node.parent.data.name
      : !is_first_column
      ? node.data.name
      : node.parent.data.name
    : dept_is_first_column
    ? node.parent.parent.data.name
    : node.parent.data.name;

  const measure_name = !is_program
    ? !dept_is_first_column
      ? is_first_column
        ? node.data.name
        : node.parent.data.name
      : !is_first_column
      ? node.data.name
      : node.parent.data.name
    : !dept_is_first_column
    ? node.parent.parent.data.name
    : node.parent.data.name;

  const program_name = is_program ? node.data.name : "";

  const notes = _.chain(
    !_.isUndefined(node.data.notes) &&
      !_.isEmpty(node.data.notes) &&
      node.data.notes
  )
    .concat([
      !_.isEmpty(node.submeasures) &&
        text_maker("budget_measure_submeasure_note"),
    ])
    .filter()
    .value();

  const popup_options = {
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
    budget_year: year_value,
    budget_data_source_date: budget_data_source_dates[year_value],
    selected_value_is_funding: node.value_type === "funding",
    selected_value_is_allocated: node.value_type === "allocated",
    selected_value_is_withheld: node.value_type === "withheld",
    selected_value_is_remaining: node.value_type === "remaining",
    show_sourced_date: node.value_type !== "funding",
    color: node.color,
    value: node.__value__,
    value_is_negative: node.__value__ < 0,
    value_is_zero: node.__value__ === 0,
    description:
      node.data.description &&
      !_.isEmpty(node.data.description) &&
      sanitized_marked(node.data.description),
    chapter:
      node.data.chapter_key && budget_chapters[node.data.chapter_key].text,
    budget_link:
      node.data.chapter_key &&
      ((node.data.chapter_key === "oth" && node.data.type !== "net_adjust") ||
        !_.isEmpty(node.data.ref_id)) &&
      BudgetMeasure.make_budget_link(node.data.chapter_key, node.data.ref_id),
    id: node.data.id,
    submeasures: node.submeasures,
    focus_text: node.magnified
      ? text_maker("partition_unfocus_button")
      : text_maker("partition_focus_button"),
  };
  return text_maker("budget_measure_popup_template", popup_options);
};

const render_diagram = (
  diagram,
  props,
  data,
  data_wrapper_node_rules,
  dont_fade
) => {
  const displayed_measure_count = _.filter(
    BudgetMeasure.get_all(),
    (measure) => {
      const measure_is_filtered_out_for_year =
        props.year_value !== measure.year;
      const measure_is_filtered_out_for_value =
        props.selected_value !== "funding" &&
        !_.some(measure.data, (row) => row[props.selected_value] !== 0);
      return (
        !measure_is_filtered_out_for_year && !measure_is_filtered_out_for_value
      );
    }
  ).length;

  diagram.configure_then_render({
    data,
    formatter,
    level_headers: get_level_headers(props.first_column, props.selected_value),
    root_text_func: _.curry(root_text_func)(
      displayed_measure_count,
      props.selected_value,
      props.year_value
    ),
    popup_template: _.curry(popup_template)(props.year_value),
    data_wrapper_node_rules,
    dont_fade,
    colors: newIBLightCategoryColors,
    background_color: color_defs.primaryColor,
  });
};

const data_wrapper_node_rules_to_be_curried = (is_funding_overview, node) => {
  const root_value = _.last(node.ancestors()).value;
  node.__value__ = node.value;
  node.open = true;
  node.how_many_to_show = function (_node) {
    if (_node.children.length <= 2) {
      return [_node.children, []];
    }
    const show = [_.head(_node.children)];
    const hide = _.tail(_node.children);
    const unhide = _.filter(hide, (__node) => {
      if (!is_funding_overview || (is_funding_overview && __node.depth !== 2)) {
        return __node.data.type !== "net_adjust"
          ? Math.abs(__node.value) > root_value / 100
          : false;
      } else {
        return true;
      }
    });
    return [show.concat(unhide), _.difference(hide, unhide)];
  };
};

const standard_update = (diagram, props) => {
  const data = budget_measures_hierarchy_factory(
    props.year_value,
    props.selected_value,
    props.first_column
  );
  const dont_fade = [];
  const data_wrapper_node_rules = _.curry(
    data_wrapper_node_rules_to_be_curried
  )(props.selected_value === "overview");
  render_diagram(diagram, props, data, data_wrapper_node_rules, dont_fade);
};

const update_with_search = (diagram, props) => {
  const search_tree = budget_measures_hierarchy_factory(
    props.year_value,
    props.selected_value,
    props.first_column
  );
  const deburred_query = _.chain(props.filter_string)
    .trim()
    .deburr()
    .lowerCase()
    .value();

  const search_matching = [];
  let nonunique_dont_fade_arrays = [];
  search_tree.each((node) => {
    if (!_.isNull(node.parent)) {
      if (node.data.search_string.indexOf(deburred_query) !== -1) {
        search_matching.push(node);
        nonunique_dont_fade_arrays = [
          nonunique_dont_fade_arrays,
          node,
          node.descendants(),
          node.ancestors(),
        ];
      }
    }
  });

  const dont_fade = _.chain(nonunique_dont_fade_arrays)
    .flattenDeep()
    .uniq()
    .value();

  const to_open = dont_fade;
  const how_many_to_be_shown = (node) => {
    const partition = _.partition(node.children, (child) =>
      _.includes(to_open, child)
    );
    return partition;
  };

  const search_data_wrapper_node_rules = (node) => {
    node.__value__ = node.value;
    node.open = true;
    node.how_many_to_show = how_many_to_be_shown;
  };

  render_diagram(
    diagram,
    props,
    search_tree,
    search_data_wrapper_node_rules,
    dont_fade
  );
};

const update_diagram = (diagram, props) => {
  if (props.filter_string) {
    update_with_search(diagram, props);
  } else {
    standard_update(diagram, props);
  }
};

export class BudgetMeasuresPartition extends React.Component {
  componentDidMount() {
    this.container = d3.select(ReactDOM.findDOMNode(this.refs.container));
    this.diagram = new PartitionDiagram(this.container, { height: 700 });
    update_diagram(this.diagram, this.props);
  }
  shouldComponentUpdate(nextProps) {
    update_diagram(this.diagram, nextProps);
    return false;
  }
  render() {
    return (
      <ContainerEscapeHatch>
        <div className="budget-measure-partiton-area" ref="container" />
      </ContainerEscapeHatch>
    );
  }
}
