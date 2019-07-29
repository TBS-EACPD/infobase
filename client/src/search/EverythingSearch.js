import { withRouter } from 'react-router';

import { BaseTypeahead } from './BaseTypeahead.js';
import {
  all_orgs_with_gov, 
  all_orgs_without_gov,
  orgs_with_data_with_gov,
  orgs_without_data_with_gov, 

  crsos as crso_search_config,
  programs as program_search_config,

  gocos, 
  horizontal_initiative,
  how_we_help, 

  datasets as table_search_config, 
  glossary_lite as glossary_lite_search_config, 
} from './search_configs.js';

import { trivial_text_maker } from '../models/text.js';


const get_org_search_config = (include_gov, include_orgs_extensive, include_orgs_limited) => {
  if (include_orgs_extensive && include_orgs_limited){
    return include_gov ? all_orgs_with_gov : all_orgs_without_gov;
  } else if (include_orgs_extensive){
    return orgs_with_data_with_gov;
  } else if (include_orgs_limited){
    return orgs_without_data_with_gov;
  }
};

const get_tag_search_configs = (include_tags_goco, include_tags_hi, include_tags_hwh) => _.compact([
  include_tags_goco && gocos,
  include_tags_hi && horizontal_initiative,
  include_tags_hwh && how_we_help,
]);

const EverythingSearch = withRouter(
  class EverythingSearch extends React.Component {
    render(){
      const {
        href_template,
        onNewQuery,
        history,

        include_gov,
        include_orgs_extensive,
        include_orgs_limited,

        include_crsos,
        include_programs,

        include_tags_goco,
        include_tags_hi,
        include_tags_hwh,

        include_tables,
        include_glossary,
      } = this.props;
    
      let { onSelect } = this.props;

      if(!onSelect && href_template){
        onSelect = item => { 
          history.push( href_template(item) );
        };
      }

      const search_configs = _.compact([
        get_org_search_config(include_gov, include_orgs_extensive, include_orgs_limited),
        
        include_crsos ? crso_search_config : null,
        include_programs ? program_search_config : null,
        
        ...get_tag_search_configs(include_tags_goco, include_tags_hi, include_tags_hwh),

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

EverythingSearch.defaultProps = {
  include_gov: true,
  include_orgs_extensive: true,
  include_orgs_limited: true,

  include_crsos: true,
  include_programs: true,

  include_tags_goco: true,
  include_tags_hi: true,
  include_tags_hwh: true,

  include_tables: true,
  include_glossary: true,
};

export { EverythingSearch };