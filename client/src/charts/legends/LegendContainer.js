import React from "react";

import { StandardLegend } from "./StandardLegend";

export const LegendContainer = ({ title, Controls, legendListProps }) => (
  // { items, isHorizontal, onClick, checkBoxProps }
  <StandardLegend title={title} legendListProps={legendListProps} />
);
