import { storiesOf } from '@storybook/react';
import React from 'react';
import { IconArray }  from './IconArray.js';

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


const fail_now = { color: 'red', className: "fas fa-times-circle"  },
      pass_now = { color: "green", className: "fas fa-check-circle" },
      fail_future = { color: "orange", className: "fas fa-clock"  },
      pass_future = { color: "green", className: "fas fa-clock" };

const order = [ pass_now, fail_now, pass_future, fail_future ];

const icon_freq = [
  fail_now,
  fail_now,
  pass_now,
  pass_now,
  pass_now,
  pass_now,
  pass_now,
  fail_future,
  fail_future,
  pass_future,
  pass_future,
  pass_future,
]

const data = _.chain(d3.range(1, 145, 1))
  .map(() => _.clone(icon_freq[_.random(0, icon_freq.length-1, false)]) )
  .sortBy(item => _.findIndex(order, item))
  .value();

storiesOf("IconArray")
  .add("basic usage", () => {
  
    return (
      <div style={_.assign({ height: "400px" }, separator_style)}>
        <IconArray 
          data={data}
          render_item={ ({ data: { className, color } }, max_dim) => {
            return `<i class="${className}" style="color:${color}; font-size:${0.8*max_dim}px;"></i>`;
          }}
          height={600}
          items_per_row={20}
          widthFirst
        />
      </div>
    )

  })
  .add("filling dimensions", () => {

    return (
      <div style={_.assign({ height: "400px" }, separator_style)}>
        <IconArray 
          data={data}
          render_item={ ({ data: { color } }, max_dim) => {
            console;
            return `<div style="background-color:${color};width: ${max_dim*1.0}px; height: ${max_dim*1.0}px;"></div>`
          }}
          height={600}
          items_per_row={20}
          widthFirst={false}
        />
      </div>
    )
  })