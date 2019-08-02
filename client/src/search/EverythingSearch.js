import { withRouter } from 'react-router';

import { BaseTypeahead } from './BaseTypeahead.js';
import {
  make_orgs_search_config,

  crsos as crso_search_config,
  programs as program_search_config,

  gocos, 
  horizontal_initiative,
  how_we_help, 

  datasets as table_search_config, 
  glossary_lite as glossary_lite_search_config, 
} from './search_configs.js';

import { trivial_text_maker } from '../models/text.js';


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
        reject_dead_orgs,

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

      const orgs_to_include = include_orgs_extensive && include_orgs_limited ?
        "all" :
        include_orgs_limited ?
          "without_data" :
          include_orgs_extensive ?
            "with_data":
            false;

      const search_configs = _.compact([
        orgs_to_include && make_orgs_search_config({include_gov, orgs_to_include, reject_dead_orgs}),
        
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
  reject_dead_orgs: true,

  include_crsos: true,
  include_programs: true,

  include_tags_goco: true,
  include_tags_hi: true,
  include_tags_hwh: true,

  include_tables: true,
  include_glossary: true,
};

export { EverythingSearch };