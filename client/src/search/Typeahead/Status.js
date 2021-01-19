import _ from "lodash";
import React from "react";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);

export class Status extends React.Component {
  state = {
    silenced: false,
    debounced: false,
  };
  debounceStateUpdate = _.debounce(() => {
    const { input_is_in_focus } = this.props;
    const { debounced } = this.state;

    !debounced &&
      this.setState({ silenced: !input_is_in_focus, debounced: true });
  }, 1400);
  componentDidUpdate(prev_props) {
    if (this.props !== prev_props) {
      this.setState({ debounced: false });
    }
  }

  render() {
    const {
      current_selected,
      current_selected_index,
      total_matching_results,
      min_length,
      query_length,
      page_range_start,
      page_range_end,
      needs_pagination_up_control,
      needs_pagination_down_control,
      pagination_size,
      next_page_size,
      paginated_results,
    } = this.props;
    const { debounced, silenced } = this.state;

    this.debounceStateUpdate();

    const num_results_showing = _.size(paginated_results);

    const result =
      total_matching_results == 1
        ? text_maker("result_single")
        : text_maker("result_multiple");

    const content = (() => {
      if (query_length < min_length) {
        return text_maker("num_chars_needed", { min_length });
      } else if (total_matching_results === 0) {
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
              num_results_showing + needs_pagination_up_control
            ) {
              return text_maker("paginate_next", { next_page_size });
            } else if (
              current_selected_index ===
              num_results_showing + 1 + needs_pagination_up_control
            ) {
              return text_maker("close_menu");
            }
          } else if (
            !needs_pagination_down_control &&
            current_selected_index ===
              num_results_showing + needs_pagination_up_control
          ) {
            return text_maker("close_menu");
          }

          return text_maker("num_results_showing_with_selected", {
            total_matching_results,
            result,
            current_selected,
            current_selected_index:
              current_selected_index -
              needs_pagination_up_control +
              page_range_start,
            page_range_end,
            page_range_start,
          });
        } else {
          return text_maker("num_results_showing", {
            total_matching_results,
            result,
            current_selected,
            current_selected_index,
            page_range_end,
            page_range_start,
          });
        }
      }
    })();

    return (
      <div className="sr-only" style={{ position: "absolute" }}>
        <div role="status" aria-atomic="true" aria-live="polite">
          {!silenced && debounced ? content : ""}
        </div>
      </div>
    );
  }
}
