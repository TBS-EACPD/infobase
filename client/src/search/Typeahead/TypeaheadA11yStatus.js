import _ from "lodash";
import React from "react";

import { create_text_maker } from "../../models/text.js";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);

class DelayedRender extends React.Component {
  constructor() {
    super();

    this.state = {
      debounced: false,
      children: null,
    };
  }
  debounceUpdate = _.debounce(() => {
    this.setState({ debounced: false });
  }, 1400);
  static getDerivedStateFromProps(nextProps, prevState) {
    const { children: prev_children } = prevState;
    const { children: next_children } = nextProps;

    if (next_children) {
      if (next_children !== prev_children) {
        return {
          debounced: true,
          children: next_children,
        };
      } else {
        return null;
      }
    } else {
      return {
        debounced: false,
        children: null,
      };
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { children: prev_children } = prevState;
    const { children, debounced } = this.state;

    if (debounced && children && children !== prev_children) {
      this.debounceUpdate();
    }
  }
  componentWillUnmount() {
    this.debounceUpdate.cancel();
  }
  render() {
    const { children } = this.props;
    const { debounced } = this.state;

    if (debounced) {
      return null;
    } else {
      return children;
    }
  }
}

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
}) => {
  const status_content = (() => {
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

      const selected_name = results_on_page[selection_cursor].name;

      const selected_position = (() => {
        const base_position = page_range_start + selection_cursor;

        if (needs_pagination_up_control) {
          return base_position - 1;
        } else {
          return base_position;
        }
      })();

      return text_maker("selected_result", {
        total_matching_results,
        selected_name,
        selected_position,
      });
    } else {
      // Cases where focus is still on the typeahead input, testing shows the status message update
      // often gets cut off by re-reading the input value, a slight delay fixes that
      return (
        <DelayedRender>
          {total_matching_results === 0 && text_maker("no_matches_found")}
          {total_matching_results > 0 &&
            text_maker("menu_with_results_status", {
              total_matching_results,
              page_range_start,
              page_range_end,
            })}
        </DelayedRender>
      );
    }
  })();

  return (
    <div className="sr-only" style={{ position: "absolute" }}>
      <div role="status" aria-atomic="true" aria-live="polite">
        {status_content}
      </div>
    </div>
  );
};
