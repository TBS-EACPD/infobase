import React from "react";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);

export const TypeaheadA11yStatus = ({
  page_size,
  selection_cursor,

  results_on_page,
  total_matching_results,
  page_range_start,
  page_range_end,
  next_page_size,
  needs_pagination_up_control,
  needs_pagination_down_control,
  total_menu_items,
}) => (
  <div className="sr-only" style={{ position: "absolute" }}>
    <div role="status" aria-atomic="false" aria-live="polite">
      {(() => {
        if (total_matching_results === 0) {
          return text_maker("no_matches_found");
        } else {
          if (selection_cursor >= 0) {
            if (needs_pagination_up_control && selection_cursor === 0) {
              return text_maker("paginate_previous", {
                page_size,
              });
            } else if (
              needs_pagination_down_control &&
              selection_cursor === total_menu_items - 1
            ) {
              return text_maker("paginate_next", { next_page_size });
            }

            const selected_name = results_on_page[selection_cursor]?.name;

            const selected_position = (() => {
              const base_position = page_range_start + selection_cursor;

              if (needs_pagination_up_control) {
                return base_position - 1;
              } else {
                return base_position;
              }
            })();

            return text_maker("selected_result_and_current_page_size", {
              total_matching_results,
              page_range_start,
              page_range_end,
              selected_name,
              selected_position,
            });
          } else {
            return text_maker("total_and_current_page_size", {
              total_matching_results,
              page_range_start,
              page_range_end,
            });
          }
        }
      })()}
    </div>
  </div>
);
