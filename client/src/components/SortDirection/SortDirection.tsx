import React from "react";

import { trivial_text_maker } from "src/models/text";

import "./SortDirection.scss";

interface SortDirectionProps {
  sortDirection: string;
  active: boolean;
  onDirectionClick: (sortDirection: boolean) => void;
}
interface SortDirectionsProps {
  asc: boolean;
  desc: boolean;
  onDirectionClick: (sortDirection: boolean) => void;
}

export const SortDirection = ({
  sortDirection,
  active,
  onDirectionClick,
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
    onClick={() => onDirectionClick(sortDirection === "DESC")}
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
  onDirectionClick,
}: SortDirectionsProps) => (
  <div className="text-nowrap">
    <SortDirection
      sortDirection="ASC"
      active={asc}
      onDirectionClick={onDirectionClick}
    />
    <SortDirection
      sortDirection="DESC"
      active={desc}
      onDirectionClick={onDirectionClick}
    />
  </div>
);
