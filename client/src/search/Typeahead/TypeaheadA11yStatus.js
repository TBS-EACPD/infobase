import React from "react";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);

export const TypeaheadA11yStatus = ({
  selection_cursor,
  pagination_size,

  results_on_page,
  total_matching_results,
  page_range_start,
  page_range_end,
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
          if (selection_cursor >= 0) {
            if (needs_pagination_up_control && selection_cursor == 0) {
              return text_maker("paginate_previous", {
                page_size: pagination_size,
              });
            } else if (needs_pagination_down_control) {
              if (
                selection_cursor ===
                results_on_page.length + needs_pagination_up_control
              ) {
                return text_maker("paginate_next", { next_page_size });
              }
            }

            return text_maker("selected_result_and_current_page_size", {
              total_matching_results,
              selected_name: results_on_page[selection_cursor]?.name,
              current_selected_number:
                selection_cursor -
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
