import classNames from "classnames";
import _ from "lodash";
import React, { useState } from "react";
import string_hash from "string-hash";

import "./TabbedContent.scss";

interface Tab<TabKeys extends string[]> {
  key: TabKeys[number];
  label: React.ReactNode;
}

export const TabbedContent = <TabKeys extends string[]>({
  tabs,
  tab_open_callback,
  open_tab_key,
  children,
}: {
  tabs: Tab<TabKeys>[];
  open_tab_key: TabKeys[number];
  tab_open_callback: (tab_key: TabKeys[number]) => void;
  children: React.ReactNode;
}) => {
  const [id] = useState(_.uniqueId("ib-tabs"));

  // hashing the key value because it might contain non-id-safe characters such as "{". TODO maybe make a generic id-escape util
  const get_panel_id = (key: TabKeys[number]) =>
    `${id}__panel-${string_hash(key)}`;

  // TODO needs some fancy custom keyboard navigation controls as per the role="tablist" spec
  return (
    <div className="ib-tabs" id={id}>
      <div className="ib-tabs__tab-list-container">
        <div role="tablist" className="ib-tabs__tab-list">
          {_.map(tabs, ({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-controls={get_panel_id(key)}
              aria-selected={key === open_tab_key}
              tabIndex={key === open_tab_key ? 0 : -1} // as per spec, navigation between tabs uses arrow keys, not tab navigation
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  const next_key = (() => {
                    const target_tabs = _.map(tabs, "key");
                    if (e.key === "ArrowLeft") {
                      target_tabs.reverse();
                    }

                    const current_index = _.findIndex(
                      target_tabs,
                      (key) => key === open_tab_key
                    );

                    if (current_index + 1 < target_tabs.length) {
                      return target_tabs[current_index + 1];
                    } else {
                      return target_tabs[0];
                    }
                  })();

                  tab_open_callback(next_key);
                  // TODO focus management
                }
              }}
              onClick={() => tab_open_callback(key)}
              className={classNames(
                "button-unstyled",
                "ib-tabs__tab",
                key === open_tab_key && "ib-tabs__tab--active"
              )}
            >
              <span className="ib-tabs__tab-label">{label}</span>
            </button>
          ))}
        </div>
        <div className="ib-tabs__tab_bottom-border" />
      </div>
      {_.map(tabs, ({ key }) => (
        <section
          key={key}
          role="tabpanel"
          id={get_panel_id(key)}
          className={classNames(
            "ib-tabs__tab-panel",
            key !== open_tab_key && "ib-tabs__tab-panel--hidden"
          )}
        >
          {key === open_tab_key && children}
        </section>
      ))}
    </div>
  );
};

interface StatefulTab extends Tab<string[]> {
  content: React.ReactNode;
}
export const TabbedContentStateful = ({ tabs }: { tabs: StatefulTab[] }) => {
  const [open_tab_key, set_open_tab_key] = useState(
    _.chain(tabs).map("key").first().value()
  );

  return (
    <TabbedContent
      tabs={tabs}
      open_tab_key={open_tab_key}
      tab_open_callback={set_open_tab_key}
    >
      {_.find(tabs, { key: open_tab_key })?.content}
    </TabbedContent>
  );
};
