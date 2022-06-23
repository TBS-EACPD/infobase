import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import React from "react";

import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  const tooltip_id = "tooltip-test-id-123";
  const target = "target";
  const TestTooltip = (
    <Tooltip
      tooltip_id={tooltip_id}
      tooltip_content={
        <div>
          some content and <button>something focusable</button>
        </div>
      }
    >
      {target}
    </Tooltip>
  );

  it("Mouse: opens on mouse enter, closes on mouse leave", async () => {
    render(TestTooltip);

    expect(document.querySelector(`#${tooltip_id}`)).not.toBeVisible();

    fireEvent.mouseEnter(screen.getByText(target));

    await waitFor(() => {
      expect(document.querySelector(`#${tooltip_id}`)).toBeVisible();
    });

    fireEvent.mouseLeave(screen.getByText(target));

    await waitFor(() => {
      expect(document.querySelector(`#${tooltip_id}`)).not.toBeVisible();
    });
  });
  it("Mouse: stays open if mouse enters the tooltip content", async () => {
    render(TestTooltip);

    fireEvent.mouseEnter(screen.getByText(target));

    await waitFor(() => {
      expect(document.querySelector(`#${tooltip_id}`)).toBeVisible();
    });

    fireEvent.mouseEnter(document.querySelector(`#${tooltip_id}`) as Element);

    expect(document.querySelector(`#${tooltip_id}`)).toBeVisible();
  });

  it("Keyboard: opens on focus, closes on blurr", async () => {
    render(TestTooltip);

    expect(document.querySelector(`#${tooltip_id}`)).not.toBeVisible();

    act(() => screen.getByText(target).focus());

    expect(document.querySelector(`#${tooltip_id}`)).toBeVisible();

    act(() => screen.getByText(target).blur());

    await waitFor(() => {
      expect(document.querySelector(`#${tooltip_id}`)).not.toBeVisible();
    });
  });
  it("Keyboard: stays open if focus enters the tooltip content", async () => {
    render(TestTooltip);

    act(() => screen.getByText(target).focus());

    expect(document.querySelector(`#${tooltip_id}`)).toBeVisible();

    fireEvent.focusIn(document.querySelector(`#${tooltip_id}`) as Element);

    expect(document.querySelector(`#${tooltip_id}`)).toBeVisible();
  });
});
