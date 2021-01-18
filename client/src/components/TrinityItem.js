import React from "react";

import "./TrinityItem.scss";

export const TrinityItem = ({ img_url, title, href, onClick }) => (
  <a href={href} className="TrinityItem fcol-md-4" onClick={onClick}>
    <div className="TrinityItem__Title">{title}</div>
    <div className="TrinityItem__Img">
      <img aria-hidden="true" src={img_url} />
    </div>
  </a>
);
