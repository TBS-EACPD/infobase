import classNames from "classnames";
import _ from "lodash";
import React from "react";
import FlipMove from "react-flip-move";
import { TransitionGroup } from "react-transition-group";
import { createSelector } from "reselect";

import {
  FirstChild,
  AccordionEnterExit,
  SortDirections,
} from "src/components/index.js";

import { trivial_text_maker } from "src/models/text.js";

import "./explorer-components.scss";

const INDENT_SIZE = 24;

function get_mod_class(node, sibling_index, explorer_context) {
  if (node.is_search_match) {
    return "ExplorerNode--search-match";
  } else if (explorer_context.zebra_stripe && sibling_index % 2) {
    return "ExplorerNode--secondary-color";
  }

  return null;
}

export const ExplorerHeader = ({
  column_defs,
  is_sortable,
  sort_col,
  is_descending,
  computed_col_styles,
  col_click,
}) => {
  return (
    <div className="ExplorerHeader ExplorerHeader--blue">
      <div className="ExplorerRow">
        {_.map(column_defs, ({ id, style, header_display }, ix) => (
          <div
            key={id}
            className="ExplorerRow__Cell"
            style={
              ix === 0
                ? { ...computed_col_styles[id], textAlign: "center" }
                : computed_col_styles[id]
            }
            onClick={() => col_click(id)}
            tabIndex={0}
            role="button"
          >
            {header_display}
            {is_sortable && (
              <SortDirections
                asc={!is_descending && sort_col === id}
                desc={is_descending && sort_col === id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/*
  children_groups: [{display,node_group},...]
*/
const get_children_content = ({
  node,
  node: { children },
  explorer_context,
  explorer_context: { children_grouper },
  depth,
}) => {
  if (_.isEmpty(children)) {
    return null;
  }
  const children_groups = _.isFunction(children_grouper)
    ? children_grouper(node, children)
    : [{ node_group: children }];

  return _.map(children_groups, ({ display, node_group }, ix) => (
    <div key={ix} className="ExplorerNodeContainer__ChildrenContainer">
      {display && (
        <div
          className="ExplorerNodeContainer__ChildrenGroupHeader"
          style={{
            marginLeft: depth && `${INDENT_SIZE}px`,
          }}
        >
          {display}
        </div>
      )}
      {node_group && (
        <FlipMove
          typeName="ul"
          className="ExplorerNodeContainer__ChildrenList"
          staggerDurationBy="0"
          duration={400}
          disableAllAnimations={node_group.length > 150} /* for perf reasons */
        >
          {_.map(node_group, (child_node, ix) => (
            <li key={child_node.id}>
              <ExplorerNode
                depth={depth}
                explorer_context={explorer_context}
                node={child_node}
                mod_class={get_mod_class(child_node, ix, explorer_context)}
              />
            </li>
          ))}
        </FlipMove>
      )}
    </div>
  ));
};
export const ExplorerNode = ({
  explorer_context,
  explorer_context: {
    column_defs,
    onClickExpand,
    computed_col_styles,
    get_non_col_content,
  },
  node,
  mod_class,
  node: {
    id,
    isExpanded,
    data,
    data: { noExpand },
  },
  depth,
}) => (
  <div
    style={{ marginLeft: depth && `${INDENT_SIZE}px` }}
    className="ExplorerNodeContainer"
  >
    <div className={classNames("ExplorerNode", mod_class)}>
      <div
        className={classNames(
          "ExplorerNode__ExpanderContainer",
          noExpand && "ExplorerNode__ExpanderContainer--no-expand"
        )}
      >
        {!noExpand && (
          <button
            className="ExplorerNode__Expander"
            onClick={() => onClickExpand(node)}
            aria-label={trivial_text_maker(
              isExpanded ? "select_to_collapse_a11y" : "select_to_expand_a11y"
            )}
          >
            {isExpanded ? "▼" : "►"}
          </button>
        )}
      </div>
      <div className="ExplorerNode__ContentContainer">
        <div
          className={classNames(
            "ExplorerNode__RowContainer",
            noExpand && "ExplorerNode__RowContainer--no-click"
          )}
          onClick={noExpand ? null : () => onClickExpand(node)}
        >
          <div className="ExplorerRow">
            {_.map(column_defs, ({ id, width, get_val, val_display }, ix) => (
              <div
                key={id}
                className="ExplorerRow__Cell"
                style={
                  ix === 0
                    ? {
                        ...computed_col_styles[id],
                        flex: `1 0 ${width - depth * INDENT_SIZE}px`,
                      }
                    : computed_col_styles[id]
                }
              >
                {_.isFunction(val_display)
                  ? val_display(get_val(node))
                  : get_val(node)}
              </div>
            ))}
          </div>
        </div>
        <TransitionGroup component={FirstChild}>
          {isExpanded && (
            <AccordionEnterExit
              expandDuration={300}
              collapseDuration={100}
              opacity={1e-20}
            >
              <div className="ExplorerNode__SuppContent">
                {_.isFunction(get_non_col_content) &&
                  get_non_col_content({ node })}
              </div>
            </AccordionEnterExit>
          )}
        </TransitionGroup>
      </div>
    </div>
    <TransitionGroup component={FirstChild}>
      {isExpanded && (
        <AccordionEnterExit
          expandDuration={300}
          collapseDuration={100}
          opacity={1e-20}
        >
          {get_children_content({
            node,
            depth: depth + 1,
            explorer_context,
          })}
        </AccordionEnterExit>
      )}
    </TransitionGroup>
  </div>
);

const ExplorerRoot = ({ root, explorer_context }) => (
  <div>
    {get_children_content({
      node: root,
      explorer_context,
      depth: 0,
    })}
  </div>
);

// api
/* 

  Node: {
    data,
    children
  }

  ColumnDefs: [
    {
      id,
      display: data => ReactEl,
      style: { padding, textAlign, ...flexProperties } (standard react-style props)
      className
      header
    }
  ]

*/

const compute_col_styles = createSelector(_.identity, (col_defs) => {
  return _.chain(col_defs)
    .map(({ id, width, textAlign }, ix) => {
      let marginRight = null;
      let marginLeft = null;
      let padding = "0 5px 0 0";
      let flex = `0 1 ${width}px`;
      if (ix === 0) {
        flex = `1 1 ${width}px`;
        if (col_defs.length > 5) {
          flex = `1 1 ${width + 300}px`;
        }
        marginRight = "auto";
      } else {
        if (ix === col_defs.length - 1) {
          //last col
          padding = "0 10px 0 5px";
        } else {
          marginLeft = "auto";
        }
      }

      return [
        id,
        {
          marginLeft,
          marginRight,
          padding,
          flex,
          textAlign,
          width: "100%", //IE
        },
      ];
    })
    .fromPairs()
    .value();
});

export class Explorer extends React.Component {
  componentDidMount() {
    this.updateWidth();
  }
  componentDidUpdate() {
    this.updateWidth();
  }
  updateWidth() {
    const { width_setter_el } = this;
    const { min_width } = this.props;
    const width = _.get(
      width_setter_el.querySelector(".ExplorerNode"), //the first row, but not the header
      "scrollWidth"
    );
    if (_.isNumber(width) && width > width_setter_el.parentNode.clientWidth) {
      if (min_width && width < min_width) {
        width_setter_el.style.minWidth = `${min_width}px`;
      } else {
        width_setter_el.style.minWidth = `${width}px`;
      }
    } else {
      width_setter_el.style.minWidth = null;
    }
  }
  render() {
    const {
      config,
      config: {
        // array of config objects, options are {id, width, textAlign, header_display, get_val}. Note header_display
        // is text or a React component, get_val is a function to extract display values from explorer nodes
        column_defs,
        shouldHideHeader,
      },
      col_state,
      root,
    } = this.props;

    const computed_col_styles = compute_col_styles(column_defs);

    const explorer_context = { computed_col_styles, ...config };

    return (
      <div style={{ overflowX: "auto" }}>
        <div ref={(el) => (this.width_setter_el = el)}>
          {!shouldHideHeader && (
            <ExplorerHeader {...explorer_context} {...col_state} />
          )}
          <ExplorerRoot explorer_context={explorer_context} root={root} />
        </div>
      </div>
    );
  }
}
