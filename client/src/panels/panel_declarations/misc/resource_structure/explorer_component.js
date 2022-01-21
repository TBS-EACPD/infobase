import _ from "lodash";
import React, { Fragment } from "react";

import { Tabs } from "src/components/index";

import { run_template } from "src/models/text";

import { Explorer } from "src/explorer_common/explorer_components";
import { get_root } from "src/explorer_common/hierarchy_tools";
import { get_col_defs } from "src/explorer_common/resource_explorer_common";
import { infographic_href_template } from "src/link_utils";

import { actual_year, planning_year, TM } from "./utils";

import "src/explorer_common/explorer-styles.scss";

const children_grouper = (node, children) => {
  //this one only has one depth, so the root must group its children
  return _.chain(children)
    .groupBy((child) => child.data.header)
    .map((node_group, header) => ({
      display: header,
      node_group,
    }))
    .value();
};

const get_non_col_content = ({ node }) => {
  const {
    data: { defs, subject },
  } = node;
  return (
    <div>
      {!_.isEmpty(defs) && (
        <dl className="dl-horizontal">
          {_.map(defs, ({ term, def }, ix) => (
            <Fragment key={ix}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </Fragment>
          ))}
        </dl>
      )}
      {
        //only tags with programs (i.e. not tags that are just group of tags) have infographics
        (_.includes(["program", "dept", "crso"], subject.subject_type) ||
          (subject.subject_type === "tag" && !_.isEmpty(subject.programs))) && (
          <div className="ExplorerNode__BRLinkContainer">
            <a href={infographic_href_template(subject)}>
              <TM k="see_infographic" />
            </a>
          </div>
        )
      }
    </div>
  );
};

export default class SingleTagResourceExplorerComponent extends React.Component {
  render() {
    const {
      flat_nodes,
      toggle_node,

      //scheme props
      is_descending,
      sort_col,
      col_click,
      year,
      set_year,
      subject,
      has_planning_data,
      has_actual_data,
    } = this.props;

    const root = get_root(flat_nodes);

    const explorer_config = {
      column_defs: get_col_defs({ year }),
      onClickExpand: (id) => toggle_node(id),
      is_sortable: true,
      zebra_stripe: true,
      get_non_col_content,
      col_click,
      children_grouper,
    };

    const inner_content = (
      <div>
        <div tabIndex={-1} ref="focus_mount" style={{ position: "relative" }}>
          <Explorer
            config={explorer_config}
            root={root}
            col_state={{
              sort_col,
              is_descending,
            }}
          />
        </div>
      </div>
    );

    if (_.includes(["WWH"], subject.root.id)) {
      return inner_content;
    }

    const tab_on_click = (year) => set_year !== year && set_year(year);

    return (
      <Tabs
        open_tab_key={year}
        tabs={_.chain([
          has_actual_data && [
            actual_year,
            <TM
              k="actual_resources"
              args={{ year: run_template(actual_year) }}
              key={actual_year}
            />,
          ],
          has_planning_data && [
            planning_year,
            <TM
              k="planned_resources"
              args={{ year: run_template(planning_year) }}
              key={planning_year}
            />,
          ],
        ])
          .compact()
          .fromPairs()
          .value()}
        tab_open_callback={tab_on_click}
      >
        {inner_content}
      </Tabs>
    );
  }
}
