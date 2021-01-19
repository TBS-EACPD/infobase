import React, { Fragment } from "react";

import { CheckBox } from "src/components";

import { create_text_maker_component } from "../shared.js";

import common_covid_text from "./covid_common_lang.yaml";

const { text_maker, TM } = create_text_maker_component(common_covid_text);

const AboveTabFootnoteList = ({ children }) => (
  <Fragment>
    <TM k={"covid_above_tab_footnote_title"} className="bold" el="span" />
    <div style={{ lineHeight: "normal" }}>{children}</div>
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
        label={text_maker("show_vote_stat_split")}
        container_style={{ justifyContent: "flex-end", marginBottom: "-15px" }}
      />
    );

    return <Inner {...{ ...inner_props, show_vote_stat, ToggleVoteStat }} />;
  }
}

export { AboveTabFootnoteList, ToggleVoteStatProvider };
