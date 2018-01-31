import { PanelManager } from '../PanelManager.js';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import panel1_def from '../panels/example-panel1.js';
import panel2_def from '../panels/example-panel2.js';
import panel3_def from '../panels/example-panel3.js';
import panel4_def from '../panels/example-panel4.js';
import panel5_def from '../panels/example-panel5.js';
import static_panel_def from '../panels/static-panel-example.js';
import basic_trend_panel from './panels/basic_trend_panel.js';

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
  if(level === "org"){
    if(bubble==="intro"){
      return [ basic_trend_panel, panel1_def, panel2_def ];
    } else if(bubble==="fin"){
      return [ panel3_def, panel4_def];
    } else if(bubble==="ppl"){
      return [ panel5_def, static_panel_def ];
    }
  }
}

/* 
  TODO: we'll want a different query if it's a program, an org, a tag, etc. 

  alternatively, use an interface type and create a schema-field called infograph name
*/ 
const query = gql`
  query BaseInfographQuery($lang: String!, $org_id: String!) {
    root(lang: $lang){
      org(org_id:$org_id){
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
    const name = _.get(data, "root.org.name");


    return <div>
      <div>
        { loading ? 
          <div> Loading ... </div> :
          <h1> { name } </h1>
        }
      </div>
      <div>
        <nav>
          <ul>
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
      <PanelManager
        a11y_mode
        subject_context={{
          id,
          level,
        }}
        panel_defs={get_panel_definitions(level,bubble)}
      />
      
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
        org_id: id,
        lang: window.lang,
      },
    }),
  }
)(Infograph_);