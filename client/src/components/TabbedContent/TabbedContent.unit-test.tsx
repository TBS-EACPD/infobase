import {
  render,
  screen,
  getAllByRole,
  getByText,
  fireEvent,
} from "@testing-library/react";
import _ from "lodash";
import React from "react";

import { TabbedContentStateful } from "./TabbedContent";

// Note: assumed that TabbedContent is fully exercised via testing of TabbedContentStateful, confirm that whenever updating
// ... or, TODO, test each in isolation, not decided if that's worth it
describe("TabbedContentStateful", () => {
  const keys_to_tab_prop = (keys: string[]) =>
    _.map(keys, (key) => ({
      key,
      label: key,
      content: key,
    }));
  const test_prop = keys_to_tab_prop(["tab1", "tab2"]);

  it("Has a tablist containing provided tab items, in the provided order", () => {
    render(<TabbedContentStateful tabs={test_prop} />);

    const tablist_node = screen.getByRole("tablist");

    const tab_nodes = getAllByRole(tablist_node, "tab");
    _.each(tab_nodes, (tab_node, index) => {
      expect(tab_node).toContainElement(
        getByText(tablist_node, test_prop[index].key)
      );
    });
  });
  it("Has one selected tab. The tab's corresponding tabpanel is the only visible panel", () => {
    render(<TabbedContentStateful tabs={test_prop} />);

    const selected_tab = screen.getByRole("tab", { selected: true });
    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(selected_tab.getAttribute("aria-controls")).toBe(visible_panel.id);
  });
  it("The visible tabpanel contains the expected content", () => {
    const selected_key = test_prop[0].key;

    render(
      <TabbedContentStateful tabs={test_prop} default_tab_key={selected_key} />
    );

    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(visible_panel).toContainElement(
      getByText(visible_panel, selected_key)
    );
  });
  it("Updates selected tab, and corresponding visible tabpanel, on click", () => {
    render(<TabbedContentStateful tabs={test_prop} />);

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

    click_tab_and_verify_update(test_prop[0].key);
    click_tab_and_verify_update(test_prop[1].key);
    click_tab_and_verify_update(test_prop[0].key);
  });
  it("Implements spec compliant arrow key navigation", () => {
    render(
      <TabbedContentStateful
        tabs={keys_to_tab_prop(["tab1", "tab2", "tab3"])}
        default_tab_key={"tab1"}
      />
    );

    const tablist_node = screen.getByRole("tablist");

    const test_arrow_navigation = (
      expected_current_key: string,
      arrow_key: "ArrowLeft" | "ArrowRight",
      expected_next_key: string
    ) => {
      const current_tab = screen.getByRole("tab", { selected: true });
      expect(current_tab).toContainElement(
        getByText(tablist_node, expected_current_key)
      );

      fireEvent.keyDown(current_tab, { key: arrow_key });

      const next_tab = screen.getByRole("tab", { selected: true });
      expect(next_tab).toContainElement(
        getByText(tablist_node, expected_next_key)
      );
      expect(next_tab).toHaveFocus();

      const visible_panel = screen.getByRole("tabpanel", { hidden: false });
      expect(screen.getByRole("tabpanel", { hidden: false })).toContainElement(
        getByText(visible_panel, expected_next_key)
      );
    };

    test_arrow_navigation("tab1", "ArrowRight", "tab2");
    test_arrow_navigation("tab2", "ArrowRight", "tab3");
    test_arrow_navigation("tab3", "ArrowLeft", "tab2");
    test_arrow_navigation("tab2", "ArrowRight", "tab3");
    test_arrow_navigation("tab3", "ArrowRight", "tab1");
    test_arrow_navigation("tab1", "ArrowLeft", "tab3");
  });
});
