// List.stories.js

import React, { Fragment } from "react";

import { BackToTop } from "./BackToTop.js";

function focusBTT () {
  document.getElementById("#test").focus();
}

const BackToTopTemplate = ({ focusId }) => (
  <Fragment>
    <div id="ib-site-header-area">Header</div>
    {focusId && <input id={focusId} placeholder="input for focus..." />}
    <div style={{ height: "500vh" }}> Scroll down to footer...</div>
    <div id="wb-info" style={{ height: "287px" }}>
      Footer
    </div>
    <BackToTop focus={focusBTT} />
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
