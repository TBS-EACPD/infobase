import _ from "lodash";
import React from "react";

import { TabbedContent, CheckBox, LinkStyled } from "src/components/index";

import { formats } from "src/core/format";

import { IconQuestion } from "src/icons/icons";

import { scroll_to_covid_key_concepts } from "./covid_key_concepts";

import { covid_create_text_maker_component } from "./covid_text_provider";

const { TM } = covid_create_text_maker_component();

const YearSelectionTabs = ({
  years,
  on_select_year,
  selected_year,
  children,
}) =>
  years.length > 1 ? (
    <TabbedContent
      open_tab_key={selected_year}
      tabs={_.chain(years)
        .map((year) => [year, formats.year_to_fiscal_year(year)])
        .fromPairs()
        .value()}
      tab_open_callback={on_select_year}
    >
      {children}
    </TabbedContent>
  ) : (
    children
  );

const AboveTabFootnoteList = ({ children }) => (
  <div className="medium-panel-text text">
    <TM k={"covid_above_tab_footnote_title"} className="bold" el="span" />
    <div style={{ lineHeight: "normal" }}>
      {children}
      <LinkStyled on_click={scroll_to_covid_key_concepts}>
        <TM k={"covid_above_tab_faq_link"} />
      </LinkStyled>
      <TM k={"covid_above_tab_footnote_item"} el="p" />
    </div>
  </div>
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
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
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
