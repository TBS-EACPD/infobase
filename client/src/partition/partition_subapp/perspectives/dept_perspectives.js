import { Subject } from '../../../models/subject.js';
import { text_maker } from '../partition_text_provider.js';
import { PartitionPerspective } from './PartitionPerspective.js';
import { get_org_hierarchy } from '../../../core/hierarchies.js';

import { 
  get_common_popup_options, 
  wrap_in_brackets, 
  formats_by_data_type,
} from './perspective_utils.js';

const dept_data_wrapper_node_rules = (node) => {
  node.__value__ = node.value;
  node.open = true;
  if (node.data.is("gov")){
    node.how_many_to_show = 8;
  } else if (node.data.is("ministry") || node.data.is("dept") || node.data.is("crso")){
    const root_value = _.last(node.ancestors()).value;

    node.how_many_to_show = function(_node){
      if (_node.children.length === 2){ return [_node.children, []];}
      const show = [_.head(_node.children)];
      const hide = _.tail(_node.children);
      const unhide = _.filter(hide, __node => Math.abs(__node.value) > root_value/50);
      return [show.concat(unhide), _.difference(hide, unhide)];
    };
  }
};

const dept_perspective_popup_template = function(d){
  const common_popup_options = get_common_popup_options(d);
  if (d.data.is("program")) {
    return text_maker("partition_program_popup", 
      _.extend(common_popup_options, {
        description: d.data.description,
        dept_name: d.data.dept.name,
        dept_id: d.data.dept.id,
      })
    );
  } else if (d.data.is("dept")) {
    return text_maker("partition_org_or_goco_popup", 
      _.extend(common_popup_options, {
        description: d.data.mandate,
      })
    );
  } else if (d.data.is("ministry")) {
    return text_maker("partition_ministry_or_sa_popup", common_popup_options);
  }
};


const dept_perspective_factory = (data_type) => new PartitionPerspective({
  id: "dept",
  name: text_maker("ministries"),
  data_type: data_type,
  formatter: node_data => wrap_in_brackets(formats_by_data_type[data_type](node_data[data_type])),
  hierarchy_factory: () => get_org_hierarchy({root: Subject.Gov, data_type}),
  data_wrapper_node_rules: dept_data_wrapper_node_rules,
  level_headers: {
    "1": text_maker("ministry"),
    "2": text_maker("org"),
    "3": text_maker("program"),
  },
  popup_template: dept_perspective_popup_template,
  root_text_func: root_value => {
    const text_key = data_type === "exp" ? "partition_spending_was" : "partition_fte_was";
    return text_maker(text_key, {x: root_value});
  },
});

const make_dept_exp_perspective = () => dept_perspective_factory("exp");

const make_dept_fte_perspective = () => dept_perspective_factory("fte");

export { 
  make_dept_exp_perspective, 
  make_dept_fte_perspective,
};