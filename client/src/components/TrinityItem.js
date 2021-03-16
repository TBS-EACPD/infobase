import React from "react";

import "./TrinityItem.scss";

export const TrinityItem = ({ svg, title, href, onClick, onMouseEnter }) => (
  <a
    href={href}
    className="TrinityItem fcol-md-4"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
  >
    <div className="TrinityItem__Title">{title}</div>
    <div className="TrinityItem__Img">{svg}</div>
  </a>
);
