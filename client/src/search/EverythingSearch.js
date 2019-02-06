import { default as withRouter } from 'react-router/withRouter';

import { BaseTypeahead } from './BaseTypeahead.js';
import {
  all_orgs_without_gov,
  orgs_with_data_with_gov, 
  all_orgs_with_gov, 
  how_we_help as hwh_search_config, 
  glossary_lite as glossary_lite_search_config, 
  gocos as goco_search_config, 
  datasets as table_search_config, 
  programs as program_search_config, 
  crsos as crso_search_config,
} from './search_configs.js';

import { trivial_text_maker } from '../models/text.js';

const EverythingSearch = withRouter(
  class EverythingSearch extends React.Component {
    render(){
      const {
        href_template,
        onNewQuery,
        include_tags,
        include_tables,
        include_programs,
        include_glossary,
        include_crsos,
        org_scope,
        history,
      } = this.props;
    
      let { onSelect } = this.props;
    
      //by default just includes organizations
      const org_search_config = {
        orgs_with_data_with_gov,
        all_orgs_without_gov,
        all_orgs_with_gov,
      }[org_scope || "orgs_with_data_with_gov"];
      
      if(!onSelect && href_template){
        onSelect = item => { 
          history.push( href_template(item) );
        }
      }
    
      const search_configs = _.compact([
        org_search_config,
        include_tags ? goco_search_config : null, 
        include_tags ? hwh_search_config : null, 
        include_crsos ? crso_search_config : null,
        include_programs ? program_search_config : null, 
        include_tables ? table_search_config : null,
        include_glossary ? glossary_lite_search_config : null,
      ]);
      
      return <BaseTypeahead
        onNewQuery = { onNewQuery }
        placeholder = { this.props.placeholder || trivial_text_maker('everything_search_placeholder') }
        search_configs = { search_configs }
        onSelect = { onSelect }
        large = { !!this.props.large }
      />;
    }
  }
);

export { EverythingSearch };