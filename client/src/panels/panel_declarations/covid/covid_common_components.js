import React, { Fragment } from "react";

import { create_text_maker_component } from "src/components/index.js";

import { CheckBox } from "src/components";
import { IconQuestion } from "src/icons/icons.js";

import { scroll_to_covid_key_concepts } from "./covid_key_concepts.js";

import common_covid_text from "./covid_common_lang.yaml";

const { TM } = create_text_maker_component(common_covid_text);

const AboveTabFootnoteList = ({ children, subject }) => (
  <Fragment>
    <TM k={"covid_above_tab_footnote_title"} className="bold" el="span" />
    <div style={{ lineHeight: "normal" }}>
      {children}
      <a className={"link-styled"} onClick={scroll_to_covid_key_concepts}>
        <TM k={"covid_above_tab_faq_link"} />
      </a>
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

export { AboveTabFootnoteList, ToggleVoteStatProvider, CellTooltip };
