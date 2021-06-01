import { useArgs } from "@storybook/client-api";
import React, { useState, useEffect } from "react";

import { CountdownCircle } from "./CountdownCircle";

export default {
  title: "CountdownCircle",
  component: CountdownCircle,
};

const Template = (args) => {
  const [end, setEnd] = useState(false);
  const [_, updateArgs] = useArgs();

  function on_end_callback() {
    console.log("Time is up! Click the button to try again.");
    setEnd(!end);
  }

  return (
    <>
      <CountdownCircle {...args} on_end_callback={on_end_callback} />
      {end ? (
        <button
          onClick={() => {
            setEnd(!end);

            // Don't want to reset the page like this, but the timer won't reset by changing the time props
            window.location.reload();
          }}
        >
          Click to Restart
        </button>
      ) : null}
    </>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  time: 10000,
  size: "20em",
  color: "blue",
  stroke_width: "1em",
  show_numbers: true,
};
