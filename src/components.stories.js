import { storiesOf } from '@storybook/react';
import React from 'react';

import { 
  RadioButtons,
} from './util_components.js';
import { ExampleTableTree } from './experimental-components/table-tree2/table-tree.js';

import { WellList } from './graphs/intro_graphs/WellList.js';


const separator_style = {
  padding: "20px",
  maxWidth: "800px",
  border:"2px dashed black",
};

storiesOf('flat design modifications', module)
  .add("button", ()=> 
    <div>
      <div style={separator_style}>
        <pre> use .btn.btn-[modifier].btn-flat </pre>
        <button className="btn btn-primary btn-flat"> standard dark background button </button> 
      </div>
      <div style={separator_style}>
        <pre> 
          use .btn.btn-[modifier].btn-flat.btn-light 
          
          these need to be defined for each modifier (just primary for now)
        </pre>
        <button className="btn btn-primary btn-flat btn-light"> with light background </button>
      </div>

      <div style={separator_style}>
        <pre> some buttons are semantic a tags, instead of buttons </pre>
        <a href="#" className="btn btn-primary btn-flat btn-light"> as a link </a>
      </div>
    </div>
  )
  .add("panel", ()=>
    <div style={separator_style}>
      <div style={{overflow:'hidden'}}>
        <div className="panel panel-info panel-flat col-sm-12 col-md-12 mrgn-bttm-md" style={{padding:0}}>
          <div className="panel-heading">
            <h3 className="panel-title">
              Panel title
            </h3>
          </div>
          <div className="panel-body">
            Panel body text
          </div>
        </div>
      </div>
    </div>
  )
  .add("WellList", ()=>
    <div style={separator_style}>
      <WellList {...well_list_props} />
    </div>
  )

storiesOf("John Radio", module)
  .add("radio", ()=> <StatefulRadioExample /> )

class StatefulRadioExample extends React.Component {
  constructor(){
    super();
    this.state = {
      activeID: 'a',
    };

    this.items = [
      {
        id: 'a',
        display: 'Option A',
      },
      {          
        id: 'b',
        display: 'Option Big Long String',
      },
      {          
        id: 'c',
        display: 'Option C',
      },
    ];

  }
  render(){
    const { activeID } = this.state;
    return (
      <RadioButtons
        options={_.map(this.items, ({id, display }) => ({ id, display, active: id === activeID }) )}
        onChange={ id =>{
          this.setState({
            activeID: id,
          })
        }}
      />
    );

  }

}

  
const well_list_props = {
  "elements": [
    {
      "display": <strong> Finances </strong>,
      "children": [
        {
          "href": "#",
          "display": "Autorisations et dépenses",
        },
        {
          "href": "#",
          "display": "Autorisations et dépenses (Rapports Financiers Trimestriels)",
        },
        {
          "href": "#",
          "display": "Budgets déposés",
        },
      ],
    },
    {
      "display": <strong>Gestion des personnes</strong>,
      "children": [
        {
          "href": "#",
          "display": "Population selon la région géographique",
        },
        {
          "href": "#",
          "display": "Population selon le groupe d’âge",
        },
        {
          "href": "#",
          "display": "Population selon le type d’employé",
        },
      ],
    },
  ],
};

storiesOf("Table Tree", module)
  .add("full width table tree", ()=> <ExampleTableTree /> )