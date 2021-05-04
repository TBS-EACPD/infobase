import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { lang } from "src/core/injected_build_constants.ts";

import "./TabbedContent.scss";

export class TabbedControls extends React.Component {
  render() {
    const { tab_options, tab_callback, disabled_message } = this.props;

    return (
      <div className="tabbed-controls">
        <ul>
          {_.map(tab_options, ({ key, label, is_open, is_disabled }) => (
            <li
              className={classNames({
                "tabbed-controls__label": true,
                "tabbed-controls__label--active": !!is_open,
                "tabbed-controls__label--disabled": !!is_disabled,
              })}
              id={key + "_tab"}
              key={key + "_tab"}
              onClick={() => !is_disabled && tab_callback(key)}
              title={is_disabled ? disabled_message : ""}
            >
              <span
                tabIndex={0}
                className="tabbed-controls__label-text"
                role="button"
                aria-pressed={is_open}
                aria-disabled={is_disabled}
                onClick={() => !is_disabled && tab_callback(key)}
                onKeyDown={(e) =>
                  !is_disabled &&
                  _.includes([13, 32], e.keyCode) &&
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
TabbedControls.defaultProps = {
  disabled_message: {
    en: "Unavailable",
    fr: "Indisponible",
  }[lang],
};

/*props: 
  tab_keys: array of keys associated with tabs,
  tab_labels: object, tab label strings stored by tab key (corresponding to each of tabKeys),
  tab_pane_contents: object, tab pane contents as JSX stored by tab key (corresponding to each of tabKeys),
*/
export class TabbedContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open_tab_key: props.tab_keys[0], // Starts with first tab open
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

    const tab_options = _.map(tab_keys, (key) => ({
      key,
      label: tab_labels[key],
      is_open: open_tab_key === key,
      is_disabled: _.includes(disabled_tabs, key),
    }));

    const tab_callback = (key) => this.setState({ open_tab_key: key });

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
TabbedContent.defaultProps = {
  disabled_tabs: [],
};
