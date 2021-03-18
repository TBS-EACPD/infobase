import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";
import { ButtonToolbar } from "react-bootstrap";
import MediaQuery from "react-responsive";

import * as util_components from "src/components/index.js";

import {
  trivial_text_maker,
} from "src/models/text.js";

import { breakpoints } from "src/core/breakpoint_defs.js";


const {
  HeightClipper,
  PinnedContent,
  AutoAccordion,
} = util_components;

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
  HeightClippedGraph,
  TspanLineWrapper,
  SomeThingsToKeepInMind,
};