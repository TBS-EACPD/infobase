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
  const test_props = _.map(["tab1", "tab2", "tab3"], (key) => ({
    key,
    label: key,
    content: key,
  }));

  it("Has a tablist containing provided tab items, in the provided order", () => {
    render(<TabbedContentStateful tabs={test_props} />);

    const tablist_node = screen.getByRole("tablist");

    const tab_nodes = getAllByRole(tablist_node, "tab");
    _.each(tab_nodes, (tab_node, index) => {
      expect(tab_node).toContainElement(
        getByText(tablist_node, test_props[index].key)
      );
    });
  });
  it("Has one selected tab. The tab's corresponding tabpanel is the only visible panel", () => {
    render(<TabbedContentStateful tabs={test_props} />);

    const selected_tab = screen.getByRole("tab", { selected: true });
    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(selected_tab.getAttribute("aria-controls")).toBe(visible_panel.id);
  });
  it("The visible tabpanel contains the expected content", () => {
    const selected_key = test_props[0].key;

    render(
      <TabbedContentStateful tabs={test_props} default_tab_key={selected_key} />
    );

    const visible_panel = screen.getByRole("tabpanel", { hidden: false });
    expect(visible_panel).toContainElement(
      getByText(visible_panel, selected_key)
    );
  });
  it("Updates selected tab, and corresponding visible tabpanel, on click", () => {
    render(<TabbedContentStateful tabs={test_props} />);

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

    click_tab_and_verify_update(test_props[0].key);
    click_tab_and_verify_update(test_props[2].key);
    click_tab_and_verify_update(test_props[0].key);
  });
  it("Implements spec compliant arrow key navigation", () => {
    // https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-21
    // TODO
  });
});
