import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";
import { ButtonToolbar } from "react-bootstrap";
import MediaQuery from "react-responsive";

import { PanelRegistry, layout_types } from "src/panels/PanelRegistry.js";

import * as util_components from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.js";
import FootNote from "src/models/footnotes/footnotes.js";
import { GlossaryEntry } from "src/models/glossary.js";
import * as Results from "src/models/results.js";
import { Subject } from "src/models/subject.js";
import {
  create_text_maker,
  trivial_text_maker,
  run_template,
} from "src/models/text.js";
import {
  year_templates,
  actual_to_planned_gap_year,
} from "src/models/years.js";

import { breakpoints } from "src/core/breakpoint_defs.js";
import {
  newIBCategoryColors,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
} from "src/core/color_schemes.js";
import { ensure_loaded } from "src/core/ensure_loaded.js";
import { formats, formatter } from "src/core/format.js";
import { Table } from "src/core/TableClass.js";

import { Canada } from "src/charts/canada/index.js";
import { StandardLegend, SelectAllControl } from "src/charts/legends/index.js";
import { get_formatter, infobase_colors_smart } from "src/charts/shared.js";
import {
  WrappedNivoBar,
  WrappedNivoHBar,
  WrappedNivoLine,
  WrappedNivoPie,
  WrappedNivoCircleProportion,
  NivoLineBarToggle,
  WrappedNivoTreemap,
} from "src/charts/wrapped_nivo/index.js";

import * as general_utils from "src/general_utils.js";
import {
  infograph_href_template,
  infograph_options_href_template,
} from "src/infographic/infographic_link.js";
import { glossary_href } from "src/link_utils.js";
import { get_source_links } from "src/metadata/data_sources.js";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link.js";
import * as table_common from "src/tables/table_common.js";

import {
  InfographicPanel,
  StdPanel,
  TextPanel,
  Col,
} from "./InfographicPanel.js";

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

const SomeThingsToKeepInMind = ({ children }) => (
  <MediaQuery maxWidth={breakpoints.maxMediumDevice}>
    {(matches) => (
      <PinnedContent local_storage_name={"user_enabled_pinning_key_concepts"}>
        <div className={classNames("mrgn-bttm-md", matches && "mrgn-tp-md")}>
          <ButtonToolbar style={{ margin: 0 }}>
            <AutoAccordion
              title={trivial_text_maker("some_things_to_keep_in_mind")}
              show_pin
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
  Table,
  rpb_link,
  get_appropriate_rpb_subject,
  Subject,
  year_templates,
  actual_to_planned_gap_year,
  businessConstants,
  general_utils,
  FootNote,
  GlossaryEntry,
  util_components,
  Format,
  infograph_href_template,
  infograph_options_href_template,
  glossary_href,
  Results,
  ensure_loaded,
  formats,
  formatter,
  trivial_text_maker,
  create_text_maker,
  run_template,
  StdPanel,
  TextPanel,
  InfographicPanel,
  Col,
  layout_types,
  TabbedControls,
  TabbedContent,
  TM,
  create_text_maker_component,
  DlItem,
  get_source_links,
  newIBCategoryColors,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  StandardLegend,
  SelectAllControl,
  WrappedNivoBar,
  WrappedNivoHBar,
  WrappedNivoLine,
  WrappedNivoPie,
  WrappedNivoCircleProportion,
  WrappedNivoTreemap,
  Canada,
  breakpoints,
  SpinnerWrapper,
  get_formatter,
  table_common,
  NivoLineBarToggle,
  infobase_colors_smart,
  // shared panel utils
  declare_panel,
  get_planned_spending_source_link,
  get_planned_fte_source_link,
  // shared panel components
  HeightClippedGraph,
  TspanLineWrapper,
  SomeThingsToKeepInMind,
};
