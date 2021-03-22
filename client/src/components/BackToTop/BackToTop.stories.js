// List.stories.js

import React, { Fragment } from "react";

import { BackToTop } from "./BackToTop.js";

const BackToTopTemplate = () => (
  <Fragment>
    <div id="ib-site-header-area">Header</div>
    <div style={{ height: "500vh" }}> Scroll down to footer...</div>
    <div id="wb-info" style={{ height: "287px" }}>
      Footer
    </div>
    <BackToTop />
  </Fragment>
);

export default {
  title: "BackToTop",
  component: BackToTopTemplate,
};

export const Default = BackToTopTemplate.bind({});
