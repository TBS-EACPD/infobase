import { storiesOf } from '@storybook/react';

import { WellList } from '../graphs/intro_graphs/WellList.js';

//attach globals that module expect to have
import {
  GraphLegend,
  TabularPercentLegend,
} from '../charts/declarative_charts.js';

import { AutoAccordion } from './Accordions.js';

import { Details } from './Details.js';

import { RadioButtons } from './RadioButtons.js';

import { Select } from './Select.js';

import { SortIndicators } from './SortIndicators.js';

import { TabbedContent } from './TabbedContent.js';

import { TwoLevelSelect } from './TwoLevelSelect.js'

const separator_style = {padding: "20px", maxWidth: "800px", border:"2px dashed black"};
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


storiesOf("Details",module)
  .add("basic usage", ()=>
    <div style={separator_style}>
      <Details
        summary_content={
          <div> Expand me </div>
        }
        content={
          <div> You expanded me! </div>
        }
      />
    </div>
  )
  .add("with initialOpen prop", ()=>
    <div style={separator_style}>
      <Details
        summary_content={
          <div> Collapse me </div>
        }
        content={
          <div> I am already expanded! </div>
        }
        initialOpen
      />
    </div>
  )

storiesOf("Tabbed Content",module)
  .add("Two tabs", ()=>
    <div style={separator_style}>
      <TabbedContent
        tabKeys={["tab1","tab2"]}
        tabLabels={{
          tab1 : "tab1",
          tab2 : "tab2",
        }}
        tabPaneContents={{
          tab1: <div>
            tab1 content!
          </div>, 
          tab2: <div>
            tab2 content!
          </div>,
        }}
      />
    </div>
  )
  .add("Too many tabs", ()=>
    <div style={separator_style}>
      <TabbedContent
        tabKeys={
          _.chain(_.range(10))
            .map(n => "tab" + n)
            .value()
        }
        tabLabels={
          _.chain(_.range(10))
            .keyBy(n => "tab" + n)
            .each((n, key, obj) => {
              obj[key] = "Too many tabs: tab" + n
            })
            .value()
        }
        tabPaneContents={
          _.chain(_.range(10))
            .keyBy(n => "tab" + n)
            .each((n, key, obj) => {
              obj[key] = <div key={n}>
                {"tab" + n +" content!"}
              </div>
            })
            .value()
        }
      />
    </div>
  )

storiesOf("Accordions",module)
  .add("AutoAccordion (usePullDown=true)", ()=>
    <div style={separator_style}>
      <pre> 
        Up/down arrow glyphicon not displaying correctly here
      </pre>
      <AutoAccordion 
        title={"Accordion Title"}
        usePullDown={true}
      >
        <div style={{paddingLeft: '10px', paddingRight:'10px'}}>
          Accordion content
        </div>
      </AutoAccordion>
    </div>
  )
  .add("AutoAccordion (usePullDown=false)", ()=>
    <div style={separator_style}>
      <pre> 
        Up/down arrow glyphicon not displaying correctly here
      </pre>
      <AutoAccordion 
        title={"Accordion Title"}
        usePullDown={false}
      >
        <div style={{paddingLeft: '10px', paddingRight:'10px'}}>
          Accordion content
        </div>
      </AutoAccordion>
    </div>
  )

storiesOf("Sort Indicators",module)
  .add("Sort Indicators", ()=>
    <div style={separator_style}>
      <pre> 
        Not sorted (note: background colours here just for contrast, component is just the arrows)
      </pre>
      <div style={{
        backgroundColor: "rgb(37, 114, 180)",
        width: "40px",
        marginBottom: "20px",
      }}>
        <SortIndicators
          asc={false}
          desc={false}
        />
      </div>
      <pre> 
        Sort ascending
      </pre>
      <div style={{
        backgroundColor: "rgb(37, 114, 180)",
        width: "40px",
        marginBottom: "20px",
      }}>
        <SortIndicators
          asc={true}
          desc={false}
        />
      </div>
      <pre> 
        Sort descending
      </pre>
      <div style={{
        backgroundColor: "rgb(37, 114, 180)",
        width: "40px",
        marginBottom: "20px",
      }}>
        <SortIndicators
          asc={false}
          desc={true}
        />
      </div>
    </div>
  )

const two_level_select_grouped_options = [
  {
    children: [
      {id: "age_group_condensed__All", display: "All"},
      {id: "age_group_condensed__Age 29 and less", display: "Age 29 and less"},
      {id: "age_group_condensed__Age 30 to 39", display: "Age 30 to 39"},
      {id: "age_group_condensed__Age 40 to 49", display: "Age 40 to 49"},
      {id: "age_group_condensed__Age 50 to 59", display: "Age 50 to 59"},
      {id: "age_group_condensed__Age 60 and over", display: "Age 60 and over"},
      {id: "age_group_condensed__Not Available", display: "Not Available"},
    ],
    display: "Condensed Age Groups",
    id: "age_group_condensed",
  },
  {
    children: [
      {id: "age_group__All", display: "All"},
      {id: "age_group__20-24", display: "20-24"},
      {id: "age_group__25-29", display: "25-29"},
      {id: "age_group__30-34", display: "30-34"},
      {id: "age_group__35-39", display: "35-39"},
      {id: "age_group__40-44", display: "40-44"},
      {id: "age_group__45-49", display: "45-49"},
      {id: "age_group__50-54", display: "50-54"},
      {id: "age_group__55-59", display: "55-59"},
      {id: "age_group__60-64", display: "60-64"},
      {id: "age_group__65-69", display: "65-69"},
      {id: "age_group__< 20", display: "< 20"},
      {id: "age_group__70 +", display: "70 +"},
      {id: "age_group__N/A", display: "N/A"},
    ],
    display: "Age Group",
    id: "age_group",
  },
]

storiesOf("Select menus",module)
  .add("Select", ()=>
    <div style={separator_style}>
      <pre> 
        No onSelect set so not interactive, just for visual testing
      </pre>
      <Select
        selected={'simple'}
        options={[
          {id: 'simple', display: 'Condensed Scheme : Min > CRSO > results'},
          {id: 'granular', display: 'Lowest Level (as per DP/DRR)'},
        ]}
        style={{fontSize:'1em'}}
        className="form-control"
      />
    </div>
  )
  .add("TwoLevelSelect", ()=>
    <div style={separator_style}>
      <pre> 
        No onSelect set so not interactive, just for visual testing
      </pre>
      <TwoLevelSelect
        className="form-control"
        id="filt_select"
        selected={'age_group__age_group__All'}
        grouped_options={two_level_select_grouped_options}
      />
    </div>
  )
