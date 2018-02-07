import { PanelManager } from '../PanelManager.js';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import panel3_def from '../panels/example-panel3.js';
import panel4_def from '../panels/example-panel4.js';
import panel5_def from '../panels/example-panel5.js';
import basic_trend_panel from './panels/basic_trend_panel.js';
import pa_vote_stat from './panels/pa-vote-stat-panel.js';
import estimates_vote_stat from './panels/estimates-vote-stat-panel.js'
import program_resources from './panels/program-resources.js';
import std_obj from './panels/std-obj-panel.js';
import transfer_payments from './panels/transfer-payments-panel.js';

import { NavLink } from 'react-router-dom';

const bubbles = [
  {
    name: "Introduction",
    key: "intro",
  },
  {
    name: "Finances",
    key: "fin",
  },
  {
    name: "People",
    key: "ppl",
  },
];

function get_panel_definitions(level, bubble){
  if(!_.find(bubbles, { key: bubble})){
    return null;
  }
  if(level === "org"){
    if(bubble==="intro"){
      return [ basic_trend_panel, estimates_vote_stat, std_obj ];
    } else if(bubble==="fin"){
      return [ pa_vote_stat, panel3_def, panel4_def];
    } else if(bubble==="ppl"){
      return [ program_resources, panel5_def, transfer_payments  ];
    }
  }
  if(level === 'gov'){
    return [ basic_trend_panel ];
  }
}

/* 
  TODO: we'll want a different query if it's a program, an org, a tag, etc. 

  alternatively, use an interface type and create a schema-field called infograph name
*/ 
const query = gql`
  query BaseInfographQuery($lang: String!, $id: String!, $level: Level!) {
    root(lang: $lang){
      subject(level: $level, id: $id){
        name
      }
    }
  }
`;


class Infograph_ extends React.Component {
  render(){
    const {
      match: {
        params: { level, id, bubble },
      },

      data,
    } = this.props;

    const { loading } = data;
    const name = _.get(data, "root.subject.name");

    const panel_defs = get_panel_definitions(level, bubble);

    return <div>
      <div>
        { loading ? 
          <div> Loading ... </div> :
          <h1> { name } </h1>
        }
      </div>
      <div>
        <nav>
          <ul role="tablist">
            {bubbles.map( ({name, key}) => 
              <li key={key}>
                <NavLink 
                  to={`/infographic/${level}/${id}/${key}`}
                  aria-selected={key===bubble}
                  role="tab"
                  title={`See the ${name} section for ${name}`}
                >
                  {name}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
      { panel_defs && 
        <PanelManager
          a11y_mode
          subject_context={{
            id,
            level,
          }}
          panel_defs={panel_defs}
        />
      }
      
    </div>;

  } 

}





export const Infograph = graphql(
  query,
  {
    options: ({ 
      match: {
        params: { level, id, bubble },
      },
    }) => ({
      variables: {
        level,
        id,
        lang: window.lang,
      },
    }),
  }
)(Infograph_);