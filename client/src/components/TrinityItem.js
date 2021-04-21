import React from "react";

import "./TrinityItem.scss";

export const TrinityItem = ({ svg, title, href, onClick }) => (
  <div className="col-12 col-lg-4">
    <a href={href} className="TrinityItem" onClick={onClick}>
      <div className="TrinityItem__Title">{title}</div>
      <div className="TrinityItem__Img">{svg}</div>
    </a>
  </div>
);
