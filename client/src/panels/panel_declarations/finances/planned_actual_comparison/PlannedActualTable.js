import React from "react";

import * as util_components from "src/components/index.js";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

const { Format, TM } = util_components;

export const PlannedActualTable = ({
  planned_ftes,
  actual_ftes,
  diff_ftes,

  planned_spend,
  actual_spend,
  diff_spend,
}) => (
  <table className="table">
    <thead>
      <tr>
        <th></th>
        <th scope="col">
          <TM k="planned" />
        </th>
        <th scope="col">
          <TM k="actual" />
        </th>
        <th scope="col">
          <TM k="difference_planned_actual" />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">
          <TM k="spending" />
        </th>
        <td>
          <Format
            type={is_a11y_mode ? "compact1_written" : "compact1"}
            content={planned_spend}
          />
        </td>
        <td>
          <Format
            type={is_a11y_mode ? "compact1_written" : "compact1"}
            content={actual_spend}
          />
        </td>
        <td>
          <Format
            type={is_a11y_mode ? "compact1_written" : "compact1"}
            content={diff_spend}
          />
        </td>
      </tr>
      <tr>
        <th scope="row">
          <TM k="ftes" />
        </th>
        <td>
          <Format type="big_int" content={planned_ftes} />
        </td>
        <td>
          <Format type="big_int" content={actual_ftes} />
        </td>
        <td>
          <Format type="big_int" content={diff_ftes} />
        </td>
      </tr>
    </tbody>
  </table>
);
