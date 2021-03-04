import React from "react";

import { TrivialTM } from "src/components/index.js";

export const SelectAllControl = ({ SelectAllOnClick, SelectNoneOnClick }) => (
  <div role="group" style={{ display: "flex", flexDirection: "row" }}>
    <div style={{ lineHeight: 2 }}>
      <TrivialTM k="select" />:
    </div>
    <button
      style={{ margin: "0px 5px 0px 5px" }}
      className="btn-ib-primary"
      onClick={SelectAllOnClick}
    >
      <TrivialTM k="all" />
    </button>
    <span style={{ lineHeight: 2 }}> | </span>
    <button
      style={{ marginLeft: "5px" }}
      className="btn-ib-primary"
      onClick={SelectNoneOnClick}
    >
      <TrivialTM k="none" />
    </button>
  </div>
);
