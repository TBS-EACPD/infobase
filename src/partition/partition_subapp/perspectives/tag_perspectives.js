import * as Subject from '../../../models/subject.js';
import { text_maker } from '../../../models/text';
import { TextMaker } from '../../../util_components';
import { Table } from '../../../core/TableClass.js';
import { PartitionDataWrapper } from "../../partition_diagram/PartitionDataWrapper.js";
import { PartitionPerspective } from './PartitionPerspective.js';

import {
  absolute_value_sort,
  post_traversal_value_set,
  post_traversal_search_string_set,
} from './data_hierarchy_utils.js';

import { 
  get_common_popup_options, 
  wrap_in_brackets, 
  formats_by_data_type,
} from './perspective_utils.js';


const create_tag_hierarchy = function(tag_scheme, data_type) {
  const distinct_root_identifier = (new Date).getTime();

  const hierarchy = d3.hierarchy(Subject.Tag.tag_roots[tag_scheme],
    node => {
      if (node.is("tag")){
        return node.children_tags.length > 0 ? node.children_tags : node.programs;
      }
    })
    .eachAfter(node => {
      post_traversal_value_set(node, data_type, distinct_root_identifier);
      post_traversal_search_string_set(node);
    })
    .sort( absolute_value_sort );
  hierarchy.exp = Table.lookup('table6').q().sum("{{pa_last_year}}exp");
  hierarchy.fte = Table.lookup('table12').q().sum("{{pa_last_year}}");
  hierarchy.value = hierarchy[data_type]; 
  return hierarchy;
};


const hwh_hierarchy_factory = (data_type, apply_node_hiding_rules) => {
  const hierarchy = create_tag_hierarchy("HWH", data_type);

  if (apply_node_hiding_rules){
    hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true;
        if (node.data.is("tag") && node.children[0].data.is("tag")){
          node.how_many_to_show = Infinity;
        }else if (node.data.is("tag") && node.children[0].data.is("program")){
          node.how_many_to_show = function(_node){
            if (_node.children.length <= 2){ return [_node.children, []]; }
            const show = [_.head(_node.children)];
            const hide = _.tail(_node.children);
            const unhide = _.filter(hide, __node => __node.value > hierarchy.value/100);
            return [show.concat(unhide), _.difference(hide, unhide)];
          }
        }
      })
      .each(node => {
        node.children = PartitionDataWrapper.__show_partial_children(node);
      });
  }

  return hierarchy;
}

const goca_hierarchy_factory = (data_type, apply_node_hiding_rules) => {
  const hierarchy = create_tag_hierarchy("GOCO", data_type);

  if (apply_node_hiding_rules){
    hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true;
        if (node.data.is("tag") && node.children && node.children[0] && node.children[0].data.is("tag")){
          node.how_many_to_show = Infinity;
        } else if (node.data.is("tag") && node.children[0].data.is("program")){
          node.how_many_to_show = function(_node){
            if (_node.children.length <= 2){ return [_node.children, []] }
            const show = [_.head(_node.children)];
            const hide = _.tail(_node.children);
            const unhide = _.filter(hide, __node => __node.value > hierarchy.value/100);
            return [show.concat(unhide), _.difference(hide, unhide)];
          }
        }
      })
      .each(node => {
        node.children = PartitionDataWrapper.__show_partial_children(node);
      });
  }
 
  return hierarchy;
}


const hwh_perspective_popup_template = function(d){
  const common_popup_options = get_common_popup_options(d);
  if (d.data.is("program")) {
    return text_maker("partition_program_popup", 
      _.extend(common_popup_options, {
        up_to: false,
        dept_name: d.data.dept.name,
        dept_id: d.data.dept.id,
        description: d.data.description,
      })
    );
  } else if (d.data.is("tag")) {
    return text_maker("partition_hwh_tag_popup", 
      _.extend(common_popup_options, {
        up_to: true,
        description: d.data.description,
      })
    );
  }
}

const goca_perspective_popup_template = function(d){
  const common_popup_options = get_common_popup_options(d);
  if (d.data.is("program")) {
    return text_maker("partition_program_popup", 
      _.extend(common_popup_options, {
        dept_name: d.data.dept.name,
        dept_id: d.data.dept.id,
        description: d.data.description,
      })
    );
  } else if (d.data.is("tag") && d.children[0].data.is("program")) {
    return text_maker("partition_org_or_goca_popup", 
      _.extend(common_popup_options, {
        description: d.data.description,
      })
    );
  } else if (d.data.is("tag") && d.children[0].data.is("tag")) {
    return text_maker("partition_ministry_or_sa_popup", 
      _.extend(common_popup_options, {
        description: d.data.description,
      })
    );
  }
}


const goca_perspective_factory = (data_type) => new PartitionPerspective({
  id: "goca",
  name: text_maker("spending_area_plural"),
  data_type: data_type,
  formater: node_data => wrap_in_brackets(formats_by_data_type[data_type](node_data[data_type])),
  hierarchy_factory: _.curry(goca_hierarchy_factory)(data_type),
  popup_template: goca_perspective_popup_template,
  root_text_func: root_value => {
    const text_key = data_type === "exp" ? "partition_spending_was" : "partition_fte_was";
    return text_maker(text_key, {x: root_value});
  },
})

const hwh_perspective_factory = (data_type) => new PartitionPerspective({
  id: "hwh",
  name: Subject.Tag.tag_roots.HWH.name,
  data_type: data_type,
  formater: node_data => {
    return node_data.data.is("tag") ?
      wrap_in_brackets(text_maker("up_to") + " " + formats_by_data_type[data_type](node_data[data_type])) :
      wrap_in_brackets(formats_by_data_type[data_type](node_data[data_type]))
  },
  hierarchy_factory: _.curry(hwh_hierarchy_factory)(data_type),
  popup_template: hwh_perspective_popup_template,
  root_text_func: root_value => text_maker("partiton_default_was_root", {x: root_value}),
  diagram_note_content: <TextMaker text_key={"MtoM_tag_warning"} />,
})

const make_goca_exp_perspective = () => goca_perspective_factory("exp");
const make_goca_fte_perspective = () => goca_perspective_factory("fte");

const make_hwh_exp_perspective = () => hwh_perspective_factory("exp");
const make_hwh_fte_perspective = () => hwh_perspective_factory("fte");

export {
  make_goca_exp_perspective,
  make_goca_fte_perspective,
  make_hwh_exp_perspective,
  make_hwh_fte_perspective,
};
