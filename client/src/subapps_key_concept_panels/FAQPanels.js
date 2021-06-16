import React from "react";

import { PanelRenderer } from "src/panels/PanelRenderer";

import { Gov } from "src/models/organizational_entities";

import { declare_estimates_comparison_key_concepts_panel } from "src/subapps_key_concept_panels/subappps_key_concept_panels";

export class EstimatesComparisonFAQ extends React.Component {
  render() {
    const panel_key = declare_estimates_comparison_key_concepts_panel();

    return <PanelRenderer panel_key={panel_key} subject={Gov} />;
  }
}
