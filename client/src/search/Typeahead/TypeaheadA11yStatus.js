import React from "react";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);

export const TypeaheadA11yStatus = ({
  current_selected_name,
  current_selected_index,
  pagination_size,
  total_matching_results,
  page_range_start,
  page_range_end,
  current_page_size,
  next_page_size,
  needs_pagination_up_control,
  needs_pagination_down_control,
}) => (
  <div className="sr-only" style={{ position: "absolute" }}>
    <div role="status" aria-atomic="false" aria-live="polite">
      {(() => {
        if (total_matching_results === 0) {
          return text_maker("no_matches_found");
        } else {
          if (current_selected_index >= 0) {
            if (needs_pagination_up_control && current_selected_index == 0) {
              return text_maker("paginate_previous", {
                page_size: pagination_size,
              });
            } else if (needs_pagination_down_control) {
              if (
                current_selected_index ===
                current_page_size + needs_pagination_up_control
              ) {
                return text_maker("paginate_next", { next_page_size });
              }
            }

            return text_maker("selected_result_and_current_page_size", {
              total_matching_results,
              current_selected_name,
              current_selected_number:
                current_selected_index -
                needs_pagination_up_control +
                page_range_start,
              page_range_start,
              page_range_end,
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
