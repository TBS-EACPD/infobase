import React from "react";

import { FootnoteList, SpinnerWrapper } from "../../components/index.js";
import { StandardRouteContainer } from "../../core/NavComponents.js";

import FootNote from "./footnotes.js";
import { load_footnotes_bundle } from "./populate_footnotes.js";

export default class FootnoteInventory extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true,
    };
  }
  loadAllFootnotes() {
    load_footnotes_bundle("all").then(() => this.setState({ loading: false }));
  }
  componentDidUpdate() {
    if (this.state.loading) {
      this.loadAllFootnotes();
    }
  }
  componentDidMount() {
    this.loadAllFootnotes();
  }
  render() {
    const { loading } = this.state;

    return (
      <StandardRouteContainer
        title={"Footnote Inventory"}
        breadcrumbs={["Footnote Inventory"]}
        description={null}
        route_key={"footnote_inventory"}
      >
        {loading && <SpinnerWrapper config_name={"sub_route"} />}
        {!loading && <FootnoteList footnotes={FootNote.get_all_flat()} />}
      </StandardRouteContainer>
    );
  }
}
