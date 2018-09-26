import { default as withRouter } from 'react-router/withRouter';

import { BaseTypeahead } from './BaseTypeahead.js';
import { 
  all_dp_orgs, 
  all_orgs_without_gov,
  orgs_with_data_with_gov, 
} from './search_configs.js';

const DeptSearch = withRouter(
  class DeptSearch extends React.Component {
    render(){
      const {
        include_orgs_without_data,
        only_include_dp,
        href_template,
        history,
        onNewQuery,
        placeholder,
      } = this.props;
    
      let { onSelect } = this.props;
      
      if(!onSelect && href_template){
        onSelect = item => { 
          history.push( href_template(item) );
        }
      }
    
      let search_config = orgs_with_data_with_gov;
      if(include_orgs_without_data){
        search_config = all_orgs_without_gov;
      }
      if(only_include_dp){
        search_config = all_dp_orgs;
      }
      
      return <BaseTypeahead
        onNewQuery = { onNewQuery }
        placeholder = { placeholder }
        search_configs = {[ search_config ]}
        onSelect = { onSelect }
      />;
    }
  }
);

export { DeptSearch };