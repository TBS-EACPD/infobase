import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { lang } from "src/core/injected_build_constants";

import "./TabbedContent.scss";

const TabbedControlsDefaultProps = {
  disabled_message: {
    en: "Unavailable",
    fr: "Indisponsible",
  }[lang],
};
type TabbedControlsProps = typeof TabbedControlsDefaultProps & {
  tab_options: tab_option[];
  tab_callback: (key: string) => void;
};
type tab_option = {
  key: string;
  label: string;
  is_open: boolean;
  is_disabled: boolean;
};

export class TabbedControls extends React.Component<TabbedControlsProps> {
  static defaultProps = TabbedControlsDefaultProps;
  render() {
    const { tab_options, tab_callback, disabled_message } = this.props;
    return (
      <div className="tabbed-controls">
        <ul className="tabbed-controls__tab-container">
          {_.map(tab_options, ({ key, label, is_open, is_disabled }) => (
            <li
              key={key + "_tab"}
              className={classNames({
                "tabbed-controls__tab": true,
                "tabbed-controls__tab--active": !!is_open,
                "tabbed-controls__tab--disabled": !!is_disabled,
              })}
              title={is_disabled ? disabled_message : ""}
            >
              <span
                tabIndex={0}
                className="tabbed-controls__label"
                role="button"
                aria-pressed={is_open}
                aria-disabled={is_disabled}
                onClick={() => !is_disabled && tab_callback(key)}
                onKeyDown={(e) =>
                  !is_disabled &&
                  _.includes(["Enter", " "], e.key) &&
                  tab_callback(key)
                }
              >
                {label}
              </span>
            </li>
          ))}
        </ul>
        <div className="tabbed-controls__bottom-border" />
      </div>
    );
  }
}

type TabbedContentProps = {
  tab_keys: string[];
  tab_labels: { [key: string]: string };
  tab_pane_contents: { [key: string]: React.ReactNode };
  disabled_tabs?: string[];
  disabled_message?: string;
};
interface TabbedContentState {
  open_tab_key: string;
}

export class TabbedContent extends React.Component<
  TabbedContentProps,
  TabbedContentState
> {
  constructor(props: TabbedContentProps) {
    super(props);
    this.state = {
      open_tab_key: props.tab_keys[0],
    };
  }

  render() {
    const {
      tab_keys,
      tab_labels,
      tab_pane_contents,
      disabled_tabs,
      disabled_message,
    } = this.props;

    const open_tab_key = this.state.open_tab_key;
    const tabPaneContent = tab_pane_contents[open_tab_key];

    const tab_options = _.map(tab_keys, (key: string) => ({
      key,
      label: tab_labels[key],
      is_open: open_tab_key === key,
      is_disabled: _.includes(disabled_tabs, key),
    }));

    const tab_callback = (key: string) => this.setState({ open_tab_key: key });

    return (
      <div className="tabbed-content">
        <TabbedControls {...{ tab_options, tab_callback, disabled_message }} />
        <div
          className="tabbed-content__pane"
          ref={open_tab_key + "_tabbed_content_pane"}
          key={open_tab_key + "_tabbed_content_pane"}
        >
          {tabPaneContent}
        </div>
      </div>
    );
  }
}
