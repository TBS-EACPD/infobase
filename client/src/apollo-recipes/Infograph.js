import { PanelManager } from './PanelManager.js';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { SearchComponent } from './search_component.js';


import panel1_def from './panels/example-panel1.js';
import panel2_def from './panels/example-panel2.js';
import panel3_def from './panels/example-panel3.js';
import panel4_def from './panels/example-panel4.js';
import panel5_def from './panels/example-panel5.js';
import static_panel_def from './panels/static-panel-example.js';
import pses_panel from './panels/pses-panel.js';

const BubbleMenu = ({ bubbles, onSelectBubble }) => {

  return <div>
    <ul>
      {_.map(bubbles, ({ key, isActive, name }) => 
        <li
          style={isActive ? { color: "red" } : {} }
          key={key}
          onClick={()=>onSelectBubble(key)}
        >
          {name}
        </li>
      )}
    </ul>
  </div>

};

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
      return [ panel1_def, panel2_def ];
    } else if(bubble==="fin"){
      return [ panel3_def, panel4_def, pses_panel ];
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
      history,

      data,
    } = this.props;

    const { loading } = data;
    const name = _.get(data, "root.org.name");

    const bubbles_menu_args = bubbles.map( ({name, key}) => ({
      name,
      key,
      isActive: key === bubble,
    }));

    return <div>
      <div>
        { loading ? 
          <div> Loading ... </div> :
          <h1> { name } </h1>
        }
      </div>
      <div>
        <SearchComponent />
      </div>
      <div>
        <BubbleMenu
          bubbles={bubbles_menu_args} 
          onSelectBubble={new_bubble_key => {
            const new_url = `/infographic/${level}/${id}/${new_bubble_key}`;
            history.push(new_url);
          }}
        />
      </div>
      <PanelManager
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