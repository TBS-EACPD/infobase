import { default as withRouter } from 'react-router/withRouter';

import { BaseTypeahead } from './BaseTypeahead.js';
import { glossary as glossary_search_config } from './search_configs.js';

const item_url = item_key => `/glossary/${item_key}`

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
          item => {
            history.push(item_url(item.id));
          }
        }
        minLength = { 4 }
      />;
    }
  }
);

export { GlossarySearch };