import _ from "lodash";
import React, { Fragment } from "react";

import { TabbedControls, CheckBox, LinkStyled } from "src/components/index.js";

import { formats } from "src/core/format.ts";

import { IconQuestion } from "src/icons/icons.tsx";

import { scroll_to_covid_key_concepts } from "./covid_key_concepts.js";

import { covid_create_text_maker_component } from "./covid_text_provider.js";

const { TM } = covid_create_text_maker_component();

const YearSelectionTabs = ({ years, on_select_year, selected_year }) =>
  years.length > 1 && (
    <TabbedControls
      tab_options={_.map(years, (year) => ({
        key: year,
        label: formats.year_to_fiscal_year(year),
        is_open: year === selected_year,
      }))}
      tab_callback={on_select_year}
    />
  );

const AboveTabFootnoteList = ({ children }) => (
  <Fragment>
    <TM k={"covid_above_tab_footnote_title"} className="bold" el="span" />
    <div style={{ lineHeight: "normal" }}>
      {children}
      <LinkStyled on_click={scroll_to_covid_key_concepts}>
        <TM k={"covid_above_tab_faq_link"} />
      </LinkStyled>
      <TM k={"covid_above_tab_footnote_item"} el="p" />
    </div>
  </Fragment>
);

class ToggleVoteStatProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_vote_stat: !!this.props.initial_show_vote_stat,
    };
  }
  toggle_show_vote_stat = () =>
    this.setState({ show_vote_stat: !this.state.show_vote_stat });
  render() {
    const { show_vote_stat } = this.state;
    const { Inner, inner_props } = this.props;

    const ToggleVoteStat = () => (
      <CheckBox
        active={show_vote_stat}
        onClick={this.toggle_show_vote_stat}
        label={<TM k="show_vote_stat_split" />}
        container_style={{ justifyContent: "flex-end", marginBottom: "-15px" }}
      />
    );

    return <Inner {...{ ...inner_props, show_vote_stat, ToggleVoteStat }} />;
  }
}

const CellTooltip = ({ tooltip_text }) => (
  <span
    style={{ display: "inline-flex" }}
    className="link-unstyled"
    tabIndex={0}
    aria-hidden="true"
    data-toggle="tooltip"
    data-ibtt-html="true"
    data-ibtt-container="body"
    data-ibtt-text={tooltip_text}
  >
    <IconQuestion width={"1.2em"} svg_style={{ verticalAlign: "0em" }} />
  </span>
);

export {
  YearSelectionTabs,
  AboveTabFootnoteList,
  ToggleVoteStatProvider,
  CellTooltip,
};
