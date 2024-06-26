import _ from "lodash";
import React from "react";

import { Tabs, CheckBox, LinkStyled } from "src/components/index";

import { formats } from "src/core/format";

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
    <Tabs
      open_tab_key={_.toString(selected_year)}
      tabs={_.chain(years)
        .map((year) => [year, formats.year_to_fiscal_year(year)])
        .fromPairs()
        .value()}
      tab_open_callback={(year_string) =>
        on_select_year(_.toInteger(year_string))
      }
    >
      {children}
    </Tabs>
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
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "-15px",
        }}
      >
        <CheckBox
          active={show_vote_stat}
          onClick={this.toggle_show_vote_stat}
          label={<TM k="show_vote_stat_split" />}
        />
        <TM k="show_vote_stat_split_glossary" style={{ marginLeft: "0.5em" }} />
      </div>
    );

    return <Inner {...{ ...inner_props, show_vote_stat, ToggleVoteStat }} />;
  }
}

export { YearSelectionTabs, AboveTabFootnoteList, ToggleVoteStatProvider };
