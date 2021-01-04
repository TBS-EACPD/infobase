import React from "react";

import d3 from "src/app_bootstrap/d3-bundle.js";
import _ from "src/app_bootstrap/lodash_mixins.js";

import { TextMaker as StandardTextMaker } from "../../../components/index.js";
import { Table } from "../../../core/TableClass.js";

import { businessConstants } from "../../../models/businessConstants";
import { Subject } from "../../../models/subject.js";
import { text_maker } from "../partition_text_provider.js";

import {
  absolute_value_sort,
  get_glossary_entry,
  post_traversal_search_string_set,
} from "./data_hierarchy_utils.js";
import { PartitionPerspective } from "./PartitionPerspective.js";

import {
  get_common_popup_options,
  wrap_in_brackets,
  formats_by_data_type,
} from "./perspective_utils.js";

const { sos } = businessConstants;

const TextMaker = (props) => (
  <StandardTextMaker text_maker_func={text_maker} {...props} />
);

const mock_model = function (id, name, description, type, extra_attrs = {}) {
  return {
    id,
    description,
    name,
    is: (__type__) => __type__ === type,
    ...extra_attrs,
  };
};

const create_spend_type_hierarchy = function () {
  return d3
    .hierarchy(Subject.gov, (node) => {
      let _mock_model;
      if (node.is("gov")) {
        _mock_model = function (id, name, type) {
          return mock_model(id, name, "", type);
        };
        return [
          _mock_model(
            "op_spending",
            text_maker("op_spending"),
            "type_of_spending"
          ),
          _mock_model(
            "capital_spending",
            text_maker("capital_spending"),
            "type_of_spending"
          ),
          _mock_model(sos["10"].text, sos["10"].text, "type_of_spending"),
          _mock_model(sos["11"].text, sos["11"].text, "type_of_spending"),
          _mock_model("revenues", text_maker("revenues"), "type_of_spending"),
        ];
      } else if (node.is("type_of_spending")) {
        _mock_model = function (so) {
          const so_num = so.so_num;
          const glossary_key =
            so_num < 21
              ? "SOBJ" + so_num
              : so_num === 21
              ? "EXT_REV"
              : "INT_REV";
          return mock_model(
            so.text + so_num,
            so.text,
            get_glossary_entry(glossary_key),
            "so",
            { so_num }
          );
        };
        const children = {
          op_spending: [
            sos["1"],
            sos["2"],
            sos["3"],
            sos["4"],
            sos["5"],
            sos["6"],
            sos["7"],
          ],
          capital_spending: [sos["8"], sos["9"]],
          [sos["10"].text]: [sos["10"]],
          [sos["11"].text]: [sos["11"]],
          revenues: [sos["21"], sos["22"]],
        }[node.id];
        return _.map(children, _mock_model);
      } else if (node.is("so")) {
        _mock_model = function (row) {
          const unique_id = Subject.Program.unique_id(
            row.dept,
            row.activity_code
          );
          const program = Subject.Program.lookup(unique_id);
          const data = { value: row["{{pa_last_year}}"] };
          return mock_model(
            unique_id + row.so_num,
            program.name +
              " - " +
              text_maker("program_slice_of", { so_name: row.so }),
            program.description,
            "program_fragment",
            {
              dept: program.dept,
              program_id: unique_id,
              tags: program.tags,
              value: data.value,
            }
          );
        };
        return Table.lookup("programSobjs")
          .data.filter((row) => row.so_num === node.so_num)
          .map(_mock_model);
      }
    })
    .eachAfter((node) => {
      if (node.data.is("program_fragment")) {
        node.exp = node.value = node.data.value;
      } else {
        node.children = _.filter(
          node.children,
          (d) => d.value !== false && d.value !== 0
        );
        node.exp = node.value = d3.sum(node.children, (d) => d.value);
      }
      post_traversal_search_string_set(node);
    })
    .sort(absolute_value_sort);
};

const spend_type_data_wrapper_node_rules = (node) => {
  node.__value__ = node.value;
  node.open = true;
  if (node.data.is("gov") || node.data.is("type_of_spending")) {
    node.how_many_to_show = Infinity;
  } else if (node.data.is("so")) {
    const root_value = _.last(node.ancestors()).value;

    node.how_many_to_show = function (_node) {
      if (_node.children.length <= 2) {
        return [_node.children, []];
      }
      const show = [_.head(_node.children)];
      const hide = _.tail(_node.children);
      const unhide = _.filter(
        hide,
        (__node) => Math.abs(__node.value) > root_value / 100
      );
      return [show.concat(unhide), _.difference(hide, unhide)];
    };
  }
};

const spend_type_perspective_popup_template = function (d) {
  const common_popup_options = get_common_popup_options(d);
  if (d.data.is("program_fragment")) {
    return text_maker(
      "partition_program_popup",
      _.extend(common_popup_options, {
        up_to: false,
        dept_name: d.data.dept.name,
        dept_id: d.data.dept.id,
        level: "program",
        id: d.data.program_id,
        description: d.data.description,
      })
    );
  } else if (d.data.is("so")) {
    return text_maker(
      "partition_so_popup",
      _.extend(common_popup_options, {
        description: d.data.description,
      })
    );
  } else if (d.data.is("type_of_spending")) {
    return text_maker("partition_ministry_or_sa_popup", common_popup_options);
  }
};

const make_spend_type_perspective = () =>
  new PartitionPerspective({
    id: "st",
    name: text_maker("type_of_spending"),
    data_type: "exp",
    formatter: (node_data) =>
      wrap_in_brackets(formats_by_data_type["exp"](node_data["exp"])),
    hierarchy_factory: () => create_spend_type_hierarchy(),
    data_wrapper_node_rules: spend_type_data_wrapper_node_rules,
    popup_template: spend_type_perspective_popup_template,
    level_headers: {
      "1": text_maker("type_of_spending"),
      "2": text_maker("sos"),
      "3": text_maker("program_slice"),
    },
    root_text_func: (root_value) =>
      text_maker("partition_spending_was", { x: root_value }),
    diagram_note_content: <TextMaker text_key={"program_SOBJ_warning"} />,
    disable_search_bar: true,
  });

export { make_spend_type_perspective };
