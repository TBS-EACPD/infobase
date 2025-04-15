import _ from "lodash";
import React from "react";

import text from "src/panels/panel_declarations/people/employee_age.yaml";

import { create_text_maker_component } from "src/components/index";

// You'll also need to import the text file that contains the "suppressed_data_pattern_note" string

const { text_maker } = create_text_maker_component(text);

/**
 * Determines if data is heavily suppressed and should show a warning
 * @param {Array} data - Array of data items with suppressedFlags
 * @param {Number} threshold - Percentage threshold (0-1) to consider data heavily suppressed
 * @returns {Object} - Object with suppression detection flags
 */
export const useSuppressedDataDetection = (data, threshold = 0.7) => {
  // Check if any data point is suppressed
  const hasSuppressedData = _.some(
    data,
    (group) => group.suppressedFlags && _.some(group.suppressedFlags)
  );

  // Calculate percentage of suppressed data
  const percentSuppressedData =
    _.chain(data)
      .flatMap((group) =>
        group.data.map((value, i) => ({
          value,
          suppressed: group.suppressedFlags[i],
        }))
      )
      .filter((item) => item.value > 0) // Only consider non-zero, non-null values
      .filter((item) => item.suppressed)
      .value().length /
      _.chain(data)
        .flatMap((group) =>
          group.data.map((value, i) => ({
            value,
            suppressed: group.suppressedFlags[i],
          }))
        )
        .filter((item) => item.value > 0) // Only consider non-zero, non-null values
        .value().length || 0; // Avoid division by zero

  // Consider data heavily suppressed if it exceeds the threshold
  const isHeavilySuppressed = percentSuppressedData > threshold;

  return {
    hasSuppressedData,
    percentSuppressedData,
    isHeavilySuppressed,
  };
};

/**
 * Creates a pattern element for suppressed data visualization
 * @returns {JSX.Element} - Pattern element JSX
 */
export const SuppressedDataPattern = () => (
  <div className="graph-note text-center mt-2 font-italic">
    <small>
      <span
        className="mr-2"
        style={{
          display: "inline-block",
          width: "20px",
          height: "10px",
          backgroundImage:
            "linear-gradient(135deg, #999 25%, #D3D3D3 25%, #D3D3D3 50%, #999 50%, #999 75%, #D3D3D3 75%)",
          backgroundSize: "8px 8px",
        }}
      ></span>
      {text_maker("suppressed_data_pattern_note")}
    </small>
  </div>
);
