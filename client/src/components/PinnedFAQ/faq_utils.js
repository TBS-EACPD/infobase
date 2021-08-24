import classNames from "classnames";

import React from "react";

import { ButtonToolbar } from "react-bootstrap";
import MediaQuery from "react-responsive";

import { SOME_THINGS_TO_KEEP_IN_MIND_STORAGE_KEY } from "src/panels/panel_declarations/common_panel_components";

import { AutoAccordion } from "src/components/Accordion/Accordions";

import { PinnedContent } from "src/components/PinnedContent/PinnedContent";

import { trivial_text_maker } from "src/models/text";

import { maxLargeDevice } from "src/style_constants/index";

export const SomeThingsToKeepInMind = ({
  children,
  is_initially_expanded,
  background_color,
}) => (
  <MediaQuery maxWidth={maxLargeDevice}>
    {(matches) => (
      <PinnedContent
        local_storage_name={SOME_THINGS_TO_KEEP_IN_MIND_STORAGE_KEY}
      >
        <div className={classNames("mrgn-bttm-md")}>
          <ButtonToolbar style={{ margin: 0 }}>
            <AutoAccordion
              title={trivial_text_maker("infographic_faq")}
              isInitiallyExpanded={is_initially_expanded}
              background_color={background_color}
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
