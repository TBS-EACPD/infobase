import { storiesOf } from '@storybook/react';
import React from 'react';

import {
  GraphLegend,
  TabularPercentLegend,
} from './declarative_charts.js'

const separator_style = {
  padding: "20px",
  maxWidth: "800px",
  border:"2px dashed black",
};

storiesOf("chart components", module)
  .add("horizontal chart legend",()=>
    <div style={separator_style}>
      <GraphLegend
        isHorizontal
        items={[
          {
            "active": true,
            "label": "Dépenses",
            "id": "Dépenses",
            "color": "#1f77b4",
          },
          {
            "active": true,
            "label": "ETP",
            "id": "ETP",
            "color": "#ff7f0e",
          },
        ]}
      />
    </div>
  )
  .add("tabular chart legend",()=>
    <div style={separator_style}>
      <TabularPercentLegend 
        items={[
          {
            "value": 0.8632482535044061,
            "label": "Période indéterminée",
            "color": "#335075",
            "id": "Période indéterminée",
          },
          {
            "value": 0.0867608784986987,
            "label": "Période déterminée",
            "color": "#2ca02c",
            "id": "Période déterminée",
          },
          {
            "value": 0.0867608784986987,
            "label": "Période déterminée",
            "color": "#2ca02c",
            "id": "other option",
          },
        ]}
        get_right_content={ _.property('value') }
      />
    </div>
  )