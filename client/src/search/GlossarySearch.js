import { default as withRouter } from 'react-router/withRouter';

import { BaseTypeahead } from './BaseTypeahead.js';
import { glossary as glossary_search_config } from './search_configs.js';

import { glossary_href } from '../link_utils.js';

const glossary_placeholder = {
  en: "Search for a term used in the InfoBase",
  fr: "Rechercher un terme utilisé dans l’InfoBase",
}[window.lang];

const GlossarySearch = withRouter(
  class GlossarySearch extends React.Component {
    render(){
      const { history } = this.props;
    
      return <BaseTypeahead
        placeholder = { glossary_placeholder }
        search_configs = { [ glossary_search_config ] }
        onSelect = {
          ({id}) => history.push( glossary_href(id) )
        }
        minLength = { 4 }
      />;
    }
  }
);

export { GlossarySearch };