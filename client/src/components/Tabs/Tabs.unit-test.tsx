import {
  render,
  screen,
  getAllByRole,
  getByText,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import _ from "lodash";
import React from "react";

import { Tabs, TabsStateful } from "./Tabs";

describe("Tabs", () => {
  const tabs = _.chain(["tab1", "tab2", "tab3"])
    .map((key) => [key, key])
    .fromPairs()
    .value();

  it("Has a tablist containing provided tab items, in the provided order", () => {
    render(
      <Tabs
        tabs={tabs}
        open_tab_key={_.keys(tabs)[0]}
        tab_open_callback={_.noop}
      >
        whatever
      </Tabs>
    );

    const tablist_node = screen.getByRole("tablist");

    const tab_nodes = getAllByRole(tablist_node, "tab");
    _.forEach(tab_nodes, (tab_node, index) => {
      expect(tab_node).toContainElement(
        getByText(tablist_node, tabs[_.keys(tabs)[index]])
      );
    });
  });
  it("Has one selected tab. The tab's corresponding tabpanel is the only visible panel", () => {
    render(
      <Tabs
        tabs={tabs}
        open_tab_key={_.keys(tabs)[0]}
        tab_open_callback={_.noop}
      >
        whatever
      </Tabs>
    );

    const selected_tab = screen.getByRole("tab", { selected: true });
    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(selected_tab.getAttribute("aria-controls")).toBe(visible_panel.id);
  });
  it("The visible tabpanel contains the expected content", () => {
    const content = "whatever";

    render(
      <Tabs
        tabs={tabs}
        open_tab_key={_.keys(tabs)[0]}
        tab_open_callback={_.noop}
      >
        {content}
      </Tabs>
    );

    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(visible_panel).toContainElement(getByText(visible_panel, content));
  });
  it("When a non-current label is clicked, calls tab_open_callback with the corresponding key", () => {
    const open_tab_key = _.keys(tabs)[0];
    const target_tab_key = _.keys(tabs)[1];
    const mock_tab_open_callback = jest.fn();

    render(
      <Tabs
        tabs={tabs}
        open_tab_key={open_tab_key}
        tab_open_callback={mock_tab_open_callback}
      >
        whatever
      </Tabs>
    );

    const tablist = screen.getByRole("tablist");

    fireEvent.click(getByText(tablist, tabs[open_tab_key]));
    expect(mock_tab_open_callback).toBeCalledTimes(0);

    fireEvent.click(getByText(tablist, tabs[target_tab_key]));
    expect(mock_tab_open_callback).toBeCalledTimes(1);
    expect(mock_tab_open_callback).toBeCalledWith(target_tab_key);
  });
  it("Implements spec compliant arrow key navigation", () => {
    const test_arrow_navigation = (
      open_tab_key: string,
      arrow_key: "ArrowLeft" | "ArrowRight",
      expected_callback_key: string
    ) => {
      cleanup();

      const mock_tab_open_callback = jest.fn();

      const { rerender } = render(
        <Tabs
          tabs={tabs}
          open_tab_key={open_tab_key}
          tab_open_callback={mock_tab_open_callback}
        >
          whatever
        </Tabs>
      );

      const tablist_node = screen.getByRole("tablist");

      const current_tab = screen.getByRole("tab", { selected: true });
      expect(current_tab).toContainElement(
        getByText(tablist_node, tabs[open_tab_key])
      );

      fireEvent.keyDown(current_tab, { key: arrow_key });
      expect(mock_tab_open_callback).toBeCalledTimes(1);
      expect(mock_tab_open_callback).toBeCalledWith(expected_callback_key);

      // when re-rendering after arrow key selection, focus should be moved to the newly selected tab
      rerender(
        <Tabs
          tabs={tabs}
          open_tab_key={expected_callback_key}
          tab_open_callback={mock_tab_open_callback}
        >
          whatever
        </Tabs>
      );
      const next_tab = screen.getByRole("tab", { selected: true });
      expect(next_tab).toHaveFocus();
    };

    test_arrow_navigation(_.keys(tabs)[0], "ArrowRight", _.keys(tabs)[1]);
    test_arrow_navigation(_.keys(tabs)[1], "ArrowRight", _.keys(tabs)[2]);
    test_arrow_navigation(_.keys(tabs)[2], "ArrowLeft", _.keys(tabs)[1]);
    test_arrow_navigation(_.keys(tabs)[1], "ArrowRight", _.keys(tabs)[2]);
    test_arrow_navigation(_.keys(tabs)[2], "ArrowRight", _.keys(tabs)[0]);
    test_arrow_navigation(_.keys(tabs)[0], "ArrowLeft", _.keys(tabs)[2]);
  });
});

describe("TabsStateful", () => {
  it("Updates selected tab, and corresponding visible tabpanel, on click", () => {
    const stateful_tabs = _.chain(["tab1", "tab2", "tab3"])
      .map((key) => [key, { label: key, content: key }])
      .fromPairs()
      .value();

    render(<TabsStateful tabs={stateful_tabs} />);

    const tablist_node = screen.getByRole("tablist");

    const click_tab_and_verify_update = (key: string) => {
      fireEvent.click(getByText(tablist_node, stateful_tabs[key].label));

      expect(screen.getByRole("tab", { selected: true })).toContainElement(
        getByText(tablist_node, stateful_tabs[key].label)
      );

      const visible_panel = screen.getByRole("tabpanel", { hidden: false });
      expect(screen.getByRole("tabpanel", { hidden: false })).toContainElement(
        getByText(visible_panel, stateful_tabs[key].content)
      );
    };

    click_tab_and_verify_update(_.keys(stateful_tabs)[0]);
    click_tab_and_verify_update(_.keys(stateful_tabs)[1]);
    click_tab_and_verify_update(_.keys(stateful_tabs)[0]);
  });
});
