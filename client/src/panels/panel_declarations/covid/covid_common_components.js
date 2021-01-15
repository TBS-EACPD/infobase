import { Fragment } from "react";

import { create_text_maker_component } from "../shared.js";

import common_covid_text from "./covid_common_lang.yaml";

const { TM } = create_text_maker_component(common_covid_text);

const AboveTabFootnoteList = ({ children }) => (
  <Fragment>
    <TM k={"covid_above_tab_footnote_title"} className="bold" el="span" />
    <div style={{ lineHeight: "normal" }}>{children}</div>
  </Fragment>
);

export { AboveTabFootnoteList };
