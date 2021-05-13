import React from "react";

import { trivial_text_maker } from "src/models/text";

// eslint-disable-next-line import/no-unresolved
import "./SortDirection.scss";

interface SortDirectionProps {
  sortDirection: string;
  active: boolean;
}
interface SortDirectionsProps {
  asc: boolean;
  desc: boolean;
}

export const SortDirection = ({
  sortDirection,
  active,
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

export const SortDirections = ({ asc, desc }: SortDirectionsProps) => (
  <div className="text-nowrap">
    <SortDirection sortDirection="ASC" active={asc} />
    <SortDirection sortDirection="DESC" active={desc} />
  </div>
);
