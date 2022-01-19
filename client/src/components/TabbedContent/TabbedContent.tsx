import classNames from "classnames";
import _ from "lodash";
import React, { useState, useEffect, useRef } from "react";
import string_hash from "string-hash";

import "./TabbedContent.scss";

type TabKey = string | number;
interface Tab {
  key: TabKey;
  label: React.ReactNode;
}

export const TabbedContent = ({
  tabs,
  open_tab_key,
  tab_open_callback,
  children,
}: {
  tabs: Tab[];
  open_tab_key: TabKey;
  tab_open_callback: (tab_key: TabKey) => void;
  children: React.ReactNode;
}) => {
  if (!_.chain(tabs).map("key").includes(open_tab_key).value()) {
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
          {_.map(tabs, ({ key, label }) => (
            <button
              key={key}
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
      {_.map(tabs, ({ key }) => (
        <section
          key={key}
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
      ))}
    </div>
  );
};

interface StatefulTab extends Tab {
  content: React.ReactNode;
}
export const TabbedContentStateful = ({
  tabs,
  default_tab_key = _.chain(tabs).map("key").first().value(),
}: {
  tabs: StatefulTab[];
  default_tab_key?: TabKey;
}) => {
  const [open_tab_key, set_open_tab_key] = useState<TabKey>(default_tab_key);

  return (
    <TabbedContent
      tabs={tabs}
      open_tab_key={open_tab_key}
      tab_open_callback={set_open_tab_key}
    >
      {_.find(tabs, ({ key }) => key === open_tab_key)?.content}
    </TabbedContent>
  );
};
