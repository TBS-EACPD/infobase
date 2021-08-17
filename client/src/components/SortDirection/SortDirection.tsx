import React from "react";

import { trivial_text_maker } from "src/models/text";

import "./SortDirection.scss";

interface SortDirectionProps {
  sortDirection: string;
  active: boolean;
  sortFunction: CallableFunction;
  col: string;
}
interface SortDirectionsProps {
  asc: boolean;
  desc: boolean;
  sortFunction: CallableFunction;
  col: string;
}

export const SortDirection = ({
  sortDirection,
  active,
  sortFunction,
  col,
}: SortDirectionProps) => (
  <button
    className="SortIndicator"
    style={{
      color: "white",
      fontSize: "1.2em",
    }}
    aria-label={trivial_text_maker(
      sortDirection === "ASC" ? "a11y_sort_asc" : "a11y_sort_desc"
    )}
    aria-pressed={active}
    onClick={() => sortFunction(col, sortDirection)}
  >
    {active
      ? sortDirection === "ASC"
        ? "▲"
        : "▼"
      : sortDirection === "ASC"
      ? "△"
      : "▽"}
  </button>
);

export const SortDirections = ({
  asc,
  desc,
  sortFunction,
  col,
}: SortDirectionsProps) => (
  <div className="text-nowrap">
    <SortDirection
      sortDirection="ASC"
      active={asc}
      sortFunction={sortFunction}
      col={col}
    />
    <SortDirection
      sortDirection="DESC"
      active={desc}
      sortFunction={sortFunction}
      col={col}
    />
  </div>
);
