// List.stories.js

import React, { Fragment } from "react";

import { BackToTop } from "./BackToTop.js";

const BackToTopTemplate = ({ focusId }) => (
  <Fragment>
    <div id="ib-site-header-area">Header</div>
    {focusId && <input id={focusId} placeholder="input for focus..." />}
    <div style={{ height: "500vh" }}> Scroll down to footer...</div>
    <div id="wb-info" style={{ height: "300px", borderTop: "2px black solid" }}>
      Footer
    </div>
    <BackToTop
      focus={() => {
        document.getElementById("#test").focus();
      }}
    />
  </Fragment>
);

export default {
  title: "BackToTop",
  component: BackToTopTemplate,
};

export const Basic = BackToTopTemplate.bind({});

export const WithFocus = BackToTopTemplate.bind({});
WithFocus.args = {
  focusId: "#test",
};
