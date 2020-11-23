import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);

export class Status extends React.Component {
  state = {
    silenced: false,
    debounced: false,
  };
  debouncedStateUpdate = _.debounce(() => {
    const { is_in_focus } = this.props;
    const { debounced } = this.state;

    !debounced && this.setState({ silenced: !is_in_focus, debounced: true });
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
    } = this.props;
    const { silenced, debounce } = this.state;

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
        return text_maker("num_results_showing", {
          total_matching_results,
          result,
          current_selected,
          page_range_end,
          page_range_start,
        });
      }
    })();

    return (
      <div className="sr-only" style={{ position: "absolute" }}>
        <div role="status" aria-atomic="true" aria-live="polite">
          {!silenced && debounce ? content : ""}
        </div>
      </div>
    );
  }
}
