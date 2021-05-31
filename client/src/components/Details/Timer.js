import React, { useState, useEffect } from "react";

export const Timer = ({ persist_content, is_open }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    setTimeout(
      () =>
        is_open || (!is_open && persist_content) ? setTime(time + 1) : null,
      1000
    );
  }, [time, is_open, persist_content]);

  const content = <div>Timer: {time}</div>;

  return content;
};
