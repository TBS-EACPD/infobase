import React, { Fragment } from "react";

import { PinnedContent } from "./PinnedContent";

const PinnedContentTemplate = ({ focusId }) => (
  <Fragment>
    <PinnedContent>
      <div
        style={{ height: "200px", width: "100%", backgroundColor: "grey" }}
      ></div>
    </PinnedContent>
    <div style={{ height: "500vh" }}> Scroll down...</div>
  </Fragment>
);

export default {
  title: "PinnedContent",
  component: PinnedContentTemplate,
};

export const Basic = PinnedContentTemplate.bind({});
