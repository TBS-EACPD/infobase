import { Story, Meta } from "@storybook/react";
import React, { Fragment } from "react";

import { BackToTop } from "./BackToTop";

interface TemplateProps {
  focusId?: string;
}
const BackToTopTemplate: Story<TemplateProps> = ({ focusId }) => (
  <Fragment>
    <div id="ib-site-header-area">Header</div>
    {focusId && <input id={focusId} placeholder="input for focus..." />}
    <div style={{ height: "500vh" }}> Scroll down to footer...</div>
    <div id="wb-info" style={{ height: "300px", borderTop: "2px black solid" }}>
      Footer
    </div>
    <BackToTop
      focus={() => {
        const test_element = document.getElementById("#test");
        if (test_element) {
          test_element.focus();
        }
      }}
    />
  </Fragment>
);

export default {
  title: "BackToTop",
  component: BackToTopTemplate,
} as Meta;

export const Basic = BackToTopTemplate.bind({});

export const WithFocus = BackToTopTemplate.bind({});
WithFocus.args = {
  focusId: "#test",
};
