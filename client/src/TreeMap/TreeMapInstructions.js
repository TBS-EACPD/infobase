import React, { Fragment } from "react";

import { FAQPanel } from "src/components/index";

import { create_text_maker } from "src/models/text";

import { primaryColor } from "src/core/color_defs";

import treemap_text from "./TreeMap.yaml";
import "./TreeMap.scss";

const text_maker = create_text_maker([treemap_text]);

export class TreeMapInstructions extends React.Component {
  constructor() {
    super();
  }
  render() {
    const q_a_keys = ["treemap_question"];

    return (
      <Fragment>
        <div className="row">
          <div className="col-md-12 col-12 col-lg-12">
            <div
              className="explore_description"
              dangerouslySetInnerHTML={{
                __html: text_maker("treemap_instructions"),
              }}
            />
          </div>
        </div>
        <FAQPanel
          rendered_q_a_keys={q_a_keys}
          background_color={primaryColor}
        />
      </Fragment>
    );
  }
}
