import React, { useState } from "react";

import { CountdownCircle } from "./CountdownCircle";

export default {
  title: "CountdownCircle",
  component: CountdownCircle,
};

const Template = (args) => {
  const [end, setEnd] = useState(false);

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
            window.location.reload();
          }}
        >
          Click to Restart
        </button>
      ) : null}
    </>
  );
};

// does not respond to the change in props
export const Basic = Template.bind({});
Basic.args = {
  time: 10000,
  size: "20em",
  color: "blue",
  stroke_width: "1em",
  show_numbers: true,
};
