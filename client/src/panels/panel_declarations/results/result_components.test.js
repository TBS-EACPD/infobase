import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { IndicatorDisplay } from "./result_components.js";

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("result_components", () => {
  it("renders correctly", () => {
    const ind = {
      id: "NI001-0030-2017",
      stable_id: "NI001-0030-2017",
      result_id: "NR001-0025-2017",
      name:
        "The current year producers’ net market income plus Business Risk Management program payments as a percent of the previous five year average",
      doc: "drr19",
      target_year: 2018,
      target_month: 3,
      is_reporting_discontinued: false,
      target_type: "percent",
      target_min: "85",
      target_max: null,
      target_narrative: null,
      measure: null,
      previous_year_target_type: null,
      previous_year_target_min: null,
      previous_year_target_max: null,
      previous_year_target_narrative: null,
      previous_year_measure: null,
      target_explanation:
        "Strong sector income growth has lead to this indicator exceeding its targets.",
      result_explanation: null,
      actual_datatype: "percent",
      actual_result: "121",
      status_key: "met",
      methodology: null,
    };

    act(() => {
      render(<IndicatorDisplay indicator={ind} show_doc={true} />, container);
    });

    expect(container.textContent).toMatchSnapshot();
  });
});
