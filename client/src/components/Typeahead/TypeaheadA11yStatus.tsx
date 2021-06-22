import _ from "lodash";
import React, { ReactNode } from "react";

import { create_text_maker } from "src/models/text";

import { ResultProps } from "./Typeahead";

import text from "./Typeahead.yaml";

const text_maker = create_text_maker(text);

interface DelayedRenderProps {
  children: ReactNode;
}

interface DelayedRenderState {
  children: ReactNode;
  debounced: boolean;
}

class DelayedRender extends React.Component<
  DelayedRenderProps,
  DelayedRenderState
> {
  constructor(props: DelayedRenderProps) {
    super(props);

    this.state = {
      debounced: false,
      children: null,
    };
  }
  debounceUpdate = _.debounce(() => {
    this.setState({ debounced: false });
  }, 1400);
  static getDerivedStateFromProps(
    nextProps: DelayedRenderProps,
    prevState: DelayedRenderState
  ) {
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
  componentDidMount() {
    this.debounceUpdate();
  }
  componentDidUpdate(prevState: DelayedRenderState) {
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

interface TypeaheadA11yStatusProps {
  selection_cursor: number;
  results: ResultProps[];
}

export const TypeaheadA11yStatus: React.FC<TypeaheadA11yStatusProps> = ({
  selection_cursor,
  results,
}) => {
  const status_content = (() => {
    if (selection_cursor >= 0) {
      const selected_name = results[selection_cursor].plain_text;

      const selected_position = selection_cursor + 1;

      return text_maker("selected_result", {
        total_results: results.length,
        selected_name,
        selected_position,
      });
    } else {
      // Cases where focus is still on the typeahead input, testing shows the status message update
      // often gets cut off by re-reading the input value, a slight delay fixes that
      return (
        <DelayedRender>
          {_.isEmpty(results) && text_maker("no_matches_found")}
          {results.length > 0 &&
            text_maker("menu_with_results_status", {
              total_results: results.length,
            })}
        </DelayedRender>
      );
    }
  })();

  return (
    <div className="sr-only">
      <div role="status" aria-atomic="true" aria-live="polite">
        {status_content}
      </div>
    </div>
  );
};
