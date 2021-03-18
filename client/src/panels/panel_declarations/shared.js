import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";
import { ButtonToolbar } from "react-bootstrap";
import MediaQuery from "react-responsive";

import { PanelRegistry} from "src/panels/PanelRegistry.js";

import * as util_components from "src/components/index.js";

import {
  trivial_text_maker,
} from "src/models/text.js";

import { breakpoints } from "src/core/breakpoint_defs.js";
import { Table } from "src/core/TableClass.js";


import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link.js";

import "./shared.scss";

const {
  Format,
  HeightClipper,
  TabbedControls,
  TabbedContent,
  TM,
  create_text_maker_component,
  SpinnerWrapper,
  DlItem,
  PinnedContent,
  AutoAccordion,
} = util_components;

const declare_panel = ({ panel_key, levels, panel_config_func }) => {
  if (!PanelRegistry.is_registered_panel_key(panel_key)) {
    levels.forEach(
      (level) =>
        new PanelRegistry({
          level,
          key: panel_key,
          ...panel_config_func(level, panel_key),
        })
    );
  }

  return panel_key;
};

const get_planned_spending_source_link = (subject) => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.lookup("programSpending");
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: "details",
      columns: ["{{planning_year_1}}"],
    }),
  };
};
const get_planned_fte_source_link = (subject) => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.lookup("programFtes");
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: "details",
      columns: ["{{planning_year_1}}"],
    }),
  };
};

const TspanLineWrapper = ({ text, width, line_height = 1 }) => (
  <Fragment>
    {_.chain(text)
      .thru((text) => text.split(/\s+/))
      .reduce(
        (lines, word) => {
          const [current_line, ...finished_lines] = _.reverse(lines);
          const potential_new_line = `${current_line} ${word}`;
          if (potential_new_line.length < width) {
            return [...finished_lines, potential_new_line];
          } else {
            return [...finished_lines, current_line, word];
          }
        },
        [""]
      )
      .map((line, ix) => (
        <tspan
          key={ix}
          x={0}
          y={0}
          dy={ix > 0 ? line_height * ix + "em" : "0em"}
        >
          {line}
        </tspan>
      ))
      .value()}
  </Fragment>
);

const HeightClippedGraph = ({ clipHeight, children }) => {
  return (
    <HeightClipper
      clipHeight={clipHeight || 185}
      allowReclip={true}
      buttonTextKey={"show_content"}
      gradientClasses={"gradient clipped-graph-gradient"}
    >
      {children}
    </HeightClipper>
  );
};

const SomeThingsToKeepInMind = ({ children, is_initially_expanded }) => (
  <MediaQuery maxWidth={breakpoints.maxMediumDevice}>
    {(matches) => (
      <PinnedContent local_storage_name={"user_enabled_pinning_key_concepts"}>
        <div className={classNames("mrgn-bttm-md", matches && "mrgn-tp-md")}>
          <ButtonToolbar style={{ margin: 0 }}>
            <AutoAccordion
              title={trivial_text_maker("infographic_faq")}
              isInitiallyExpanded={is_initially_expanded}
            >
              <div
                style={{
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                {children}
              </div>
            </AutoAccordion>
          </ButtonToolbar>
        </div>
      </PinnedContent>
    )}
  </MediaQuery>
);

export {
  // re-exports
  Format,
  TabbedControls,
  TabbedContent,
  TM,
  create_text_maker_component,
  SpinnerWrapper,
  DlItem,
  // shared panel utils
  declare_panel,
  get_planned_spending_source_link,
  get_planned_fte_source_link,
  // shared panel components
  HeightClippedGraph,
  TspanLineWrapper,
  SomeThingsToKeepInMind,
};
