import React from "react";

import { FootnoteList, LeafSpinner } from "src/components/index";

import { StandardRouteContainer } from "src/core/NavComponents";

import FootNote from "./footnotes";

import { load_footnotes_bundle } from "./populate_footnotes";

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
        {loading && <LeafSpinner config_name={"sub_route"} />}
        {!loading && <FootnoteList footnotes={FootNote.get_all_flat()} />}
      </StandardRouteContainer>
    );
  }
}
