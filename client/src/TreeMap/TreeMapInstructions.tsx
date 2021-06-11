import React, { Fragment } from "react";

import { create_text_maker } from "src/models/text";

import treemap_text from "./TreeMap.yaml";
import "./TreeMap.scss";

const text_maker = create_text_maker([treemap_text]);

// Purpose of DummyProp is to avoid argument error with super() since it expects at least one argument
interface DummyProp {
  dummy: true;
}

export class TreeMapInstructions extends React.Component<DummyProp> {
  constructor(prop: DummyProp) {
    super(prop);
  }
  render() {
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
      </Fragment>
    );
  }
}
