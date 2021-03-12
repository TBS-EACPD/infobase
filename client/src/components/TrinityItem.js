import React from "react";

import "./TrinityItem.scss";

export const TrinityItem = ({ svg, title, href, onMouseEnter }) => {
  return (
    <a
      href={href}
      className="TrinityItem fcol-md-4"
      onMouseEnter={onMouseEnter}
    >
      <div className="TrinityItem__Title">{title}</div>
      <div className="TrinityItem__Img">{svg}</div>
    </a>
  );
};
