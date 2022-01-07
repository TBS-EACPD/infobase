import classNames from "classnames";
import _ from "lodash";
import React, { useState } from "react";

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
        <div className="tabbed-controls__tab-list">
          {_.map(tab_options, ({ key, label, is_open, is_disabled }) => (
            <button
              key={key + "_tab"}
              aria-pressed={is_open}
              onClick={() => !is_disabled && tab_callback(key)}
              aria-disabled={is_disabled}
              title={is_disabled ? disabled_message : ""}
              className={classNames({
                "button-unstyled": true,
                "tabbed-controls__tab": true,
                "tabbed-controls__tab--active": !!is_open,
                "tabbed-controls__tab--disabled": !!is_disabled,
              })}
            >
              <span className="tabbed-controls__label">{label}</span>
            </button>
          ))}
        </div>
        <div className="tabbed-controls__bottom-border" />
      </div>
    );
  }
}

export const Tabs = <TabKeys extends string[]>({
  tabs,
  tab_open_callback,
  open_tab_key,
  children,
}: {
  tabs: {
    key: TabKeys[number];
    label: string;
    is_disabled?: boolean;
    disabled_message?: string;
  }[];
  open_tab_key: TabKeys[number];
  tab_open_callback: (tab_key: TabKeys[number]) => void;
  children: React.ReactNode;
}) => {
  const [id] = useState(_.uniqueId());
  const get_panel_id = (key: TabKeys[number]) => `tab_panel_${key}_${id}`;

  // TODO needs some fancy custom keyboard navigation controls as per the role="tablist" spec
  return (
    <div className="tabbed-content" id={id}>
      <div className="tabbed-controls">
        <div role="tablist" className="tabbed-controls__tab-list">
          {_.map(tabs, ({ key, label, is_disabled, disabled_message }) => (
            <button
              key={key + "_tab"}
              role="tab"
              aria-controls={get_panel_id(key)}
              aria-selected={key === open_tab_key}
              onClick={() => !is_disabled && tab_open_callback(key)}
              aria-disabled={is_disabled}
              title={is_disabled ? disabled_message : ""}
              className={classNames(
                "button-unstyled",
                "tabbed-controls__tab",
                key === open_tab_key && "tabbed-controls__tab--active",
                !!is_disabled && "tabbed-controls__tab--disabled"
              )}
            >
              <span className="tabbed-controls__label">{label}</span>
            </button>
          ))}
        </div>
        <div className="tabbed-controls__bottom-border" />
      </div>
      {_.map(tabs, ({ key }) => (
        <section
          key={key}
          role="tabpanel"
          id={get_panel_id(open_tab_key)}
          className={classNames(
            "tabbed-content__pane",
            key !== open_tab_key && "hidden"
          )}
        >
          {key === open_tab_key && children}
        </section>
      ))}
    </div>
  );
};

export const StatefulTabs = <TabKeys extends string[]>({
  tab_keys,
  tab_labels,
  tab_pane_contents,
  disabled_tabs,
  disabled_message,
}: {
  tab_keys: TabKeys;
  tab_labels: { [key in TabKeys[number]]: string };
  tab_pane_contents: { [key in TabKeys[number]]: React.ReactNode };
  disabled_tabs?: TabKeys[number][];
  disabled_message?: string;
}) => {
  const [open_tab_key, set_open_tab_key] = useState(
    tab_keys[0] as TabKeys[number]
  );

  const tabs = _.map<
    TabKeys[number],
    {
      key: TabKeys[number];
      label: string;
      is_disabled?: boolean;
      disabled_message?: string;
    }
  >(tab_keys, (key) => ({
    key,
    label: tab_labels[key],
    is_disabled: _.includes(disabled_tabs, key),
    disabled_message,
  }));

  return (
    <Tabs
      tabs={tabs}
      open_tab_key={open_tab_key}
      tab_open_callback={set_open_tab_key}
    >
      {tab_pane_contents[open_tab_key]}
    </Tabs>
  );
};
