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

import { TabbedContent, TabbedContentStateful } from "./TabbedContent";

describe("TabbedContent", () => {
  const tabs = _.map(["tab1", "tab2", "tab3"], (key) => ({
    key,
    label: key,
  }));

  it("Has a tablist containing provided tab items, in the provided order", () => {
    render(
      <TabbedContent
        tabs={tabs}
        open_tab_key={tabs[0].key}
        tab_open_callback={_.noop}
      >
        whatever
      </TabbedContent>
    );

    const tablist_node = screen.getByRole("tablist");

    const tab_nodes = getAllByRole(tablist_node, "tab");
    _.each(tab_nodes, (tab_node, index) => {
      expect(tab_node).toContainElement(
        getByText(tablist_node, tabs[index].label)
      );
    });
  });
  it("Has one selected tab. The tab's corresponding tabpanel is the only visible panel", () => {
    render(
      <TabbedContent
        tabs={tabs}
        open_tab_key={tabs[0].key}
        tab_open_callback={_.noop}
      >
        whatever
      </TabbedContent>
    );

    const selected_tab = screen.getByRole("tab", { selected: true });
    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(selected_tab.getAttribute("aria-controls")).toBe(visible_panel.id);
  });
  it("The visible tabpanel contains the expected content", () => {
    const content = "whatever";

    render(
      <TabbedContent
        tabs={tabs}
        open_tab_key={tabs[0].key}
        tab_open_callback={_.noop}
      >
        {content}
      </TabbedContent>
    );

    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(visible_panel).toContainElement(getByText(visible_panel, content));
  });
  it("When a non-current label is clicked, calls tab_open_callback with the corresponding key", () => {
    const open_tab = tabs[0];
    const target_tab = tabs[1];
    const mock_tab_open_callback = jest.fn();

    render(
      <TabbedContent
        tabs={tabs}
        open_tab_key={open_tab.key}
        tab_open_callback={mock_tab_open_callback}
      >
        whatever
      </TabbedContent>
    );

    fireEvent.click(getByText(screen.getByRole("tablist"), open_tab.label));
    expect(mock_tab_open_callback).toBeCalledTimes(0);

    fireEvent.click(getByText(screen.getByRole("tablist"), target_tab.label));
    expect(mock_tab_open_callback).toBeCalledWith(target_tab.key);
  });
  it("Implements spec compliant arrow key navigation", () => {
    const tabs = _.map(["tab1", "tab2", "tab3"], (key) => ({
      key,
      label: key,
    }));

    const test_arrow_navigation = (
      open_tab: { key: string; label: string },
      arrow_key: "ArrowLeft" | "ArrowRight",
      expected_callback_key: string
    ) => {
      cleanup();

      const mock_tab_open_callback = jest.fn();

      const { rerender } = render(
        <TabbedContent
          tabs={tabs}
          open_tab_key={open_tab.key}
          tab_open_callback={mock_tab_open_callback}
        >
          whatever
        </TabbedContent>
      );

      const tablist_node = screen.getByRole("tablist");

      const current_tab = screen.getByRole("tab", { selected: true });
      expect(current_tab).toContainElement(
        getByText(tablist_node, open_tab.label)
      );

      fireEvent.keyDown(current_tab, { key: arrow_key });
      expect(mock_tab_open_callback).toBeCalledWith(expected_callback_key);

      // when re-rendering after arrow key selection, focus should be moved to the newly selected tab
      rerender(
        <TabbedContent
          tabs={tabs}
          open_tab_key={expected_callback_key}
          tab_open_callback={mock_tab_open_callback}
        >
          whatever
        </TabbedContent>
      );
      const next_tab = screen.getByRole("tab", { selected: true });
      expect(next_tab).toHaveFocus();
    };

    test_arrow_navigation(tabs[0], "ArrowRight", tabs[1].key);
    test_arrow_navigation(tabs[1], "ArrowRight", tabs[2].key);
    test_arrow_navigation(tabs[2], "ArrowLeft", tabs[1].key);
    test_arrow_navigation(tabs[1], "ArrowRight", tabs[2].key);
    test_arrow_navigation(tabs[2], "ArrowRight", tabs[0].key);
    test_arrow_navigation(tabs[0], "ArrowLeft", tabs[2].key);
  });
});

describe("TabbedContentStateful", () => {
  it("Updates selected tab, and corresponding visible tabpanel, on click", () => {
    const stateful_tabs = _.map(["tab1", "tab2", "tab3"], (key) => ({
      key,
      label: key,
      content: key,
    }));

    render(<TabbedContentStateful tabs={stateful_tabs} />);

    const tablist_node = screen.getByRole("tablist");

    const click_tab_and_verify_update = (key: string) => {
      fireEvent.click(getByText(tablist_node, key));

      expect(screen.getByRole("tab", { selected: true })).toContainElement(
        getByText(tablist_node, key)
      );

      const visible_panel = screen.getByRole("tabpanel", { hidden: false });
      expect(screen.getByRole("tabpanel", { hidden: false })).toContainElement(
        getByText(visible_panel, key)
      );
    };

    click_tab_and_verify_update(stateful_tabs[0].key);
    click_tab_and_verify_update(stateful_tabs[1].key);
    click_tab_and_verify_update(stateful_tabs[0].key);
  });
});
