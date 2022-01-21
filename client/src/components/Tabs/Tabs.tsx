import classNames from "classnames";
import _ from "lodash";
import React, { useState, useEffect, useRef } from "react";
import string_hash from "string-hash";

import "./Tabs.scss";

export const Tabs = <
  Tabs extends {
    [key: string]: React.ReactNode;
  },
  TabKey extends keyof Tabs
>({
  tabs,
  open_tab_key,
  tab_open_callback,
  children,
}: {
  tabs: Tabs;
  open_tab_key: TabKey;
  tab_open_callback: (tab_key: TabKey) => void;
  children: React.ReactNode;
}) => {
  if (!_.has(tabs, open_tab_key)) {
    throw new Error(
      `Provided open_tab_key "${open_tab_key}" does not correspond to any provided tab ${_.map(
        tabs,
        "key"
      )}`
    );
  }

  const [id] = useState(_.uniqueId("ib-tabs-"));

  // hashing the key value because it might contain non-id-safe characters such as "{". TODO maybe make a generic id-escape util
  const get_panel_id = (key: TabKey) =>
    `${id}__panel-${string_hash(_.toString(key))}`;

  const is_arrow_key_navigating = useRef(false);
  const open_panel_id = get_panel_id(open_tab_key);
  useEffect(() => {
    if (is_arrow_key_navigating.current) {
      (
        document.querySelector(`button[aria-controls="${open_panel_id}"]`) as
          | HTMLButtonElement
          | undefined
      )?.focus();
    }

    is_arrow_key_navigating.current = false;
  }, [open_panel_id]);

  return (
    <div className="ib-tabs" id={id}>
      <div className="ib-tabs__tab-list-container">
        <div role="tablist" className="ib-tabs__tab-list">
          {_.map(tabs, (label, key: TabKey) => (
            <button
              key={_.toString(key)}
              role="tab"
              className={classNames(
                "button-unstyled",
                "ib-tabs__tab",
                key === open_tab_key && "ib-tabs__tab--active"
              )}
              aria-controls={get_panel_id(key)}
              aria-selected={key === open_tab_key}
              onClick={() => key !== open_tab_key && tab_open_callback(key)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  is_arrow_key_navigating.current = true;

                  const next_key = (() => {
                    const tab_keys = _.keys(tabs) as TabKey[];
                    if (e.key === "ArrowLeft") {
                      tab_keys.reverse();
                    }

                    const current_index = _.findIndex(
                      tab_keys,
                      (key) => key === open_tab_key
                    );

                    if (current_index + 1 < tab_keys.length) {
                      return tab_keys[current_index + 1];
                    } else {
                      return tab_keys[0];
                    }
                  })();

                  tab_open_callback(next_key);
                }
              }}
              /*
                Note: per the spec, only the selected tab should be in the tab navigation order, controlling the tabs is arrow key based...
                BUT the spec is still not widely followed in the wild. IMO, the better user experience is to support the spec's arrow key controls
                but ALSO allow tab navigation between them?

                To fully meet the spec, uncomment the following line:
                tabIndex={key === open_tab_key ? 0 : -1}
              */
            >
              <span className="ib-tabs__tab-label">{label}</span>
            </button>
          ))}
        </div>
        <div className="ib-tabs__tab_bottom-border" />
      </div>
      {_.chain(tabs)
        .keys()
        .map((key: TabKey) => (
          <section
            key={_.toString(key)}
            role="tabpanel"
            id={get_panel_id(key)}
            className={classNames(
              "ib-tabs__tab-panel",
              key !== open_tab_key && "ib-tabs__tab-panel--hidden"
            )}
            aria-hidden={key !== open_tab_key}
          >
            {key === open_tab_key && children}
          </section>
        ))
        .value()}
    </div>
  );
};

export const TabsStateful = <
  Tabs extends {
    [key: string]: { label: React.ReactNode; content: React.ReactNode };
  },
  TabKey extends keyof Tabs
>({
  tabs,
  default_tab_key = _.chain(tabs).keys().first().value() as TabKey,
}: {
  tabs: Tabs;
  default_tab_key?: TabKey;
}) => {
  const [open_tab_key, set_open_tab_key] = useState<TabKey>(default_tab_key);

  return (
    <Tabs
      tabs={_.mapValues(tabs, ({ label }) => label)}
      open_tab_key={open_tab_key}
      tab_open_callback={set_open_tab_key}
    >
      {tabs[open_tab_key].content}
    </Tabs>
  );
};
