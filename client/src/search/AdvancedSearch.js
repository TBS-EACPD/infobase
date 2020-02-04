import './AdvancedSearch.scss';
import text from "./AdvancedSearch.yaml";

import { EverythingSearch } from './EverythingSearch.js';

import { Details } from '../components/Details.js';
import { CheckBox } from '../components/CheckBox';

import { create_text_maker } from '../models/text.js';
const text_maker = create_text_maker(text);

// Maintenance alert: this will need to be kept in sync with the search config options available on the EverythingSearch
//  - Leaf nodes should have a key corresponding to an EverythingSearch search prop. Parent nodes should not, they're just grouping categories
//  - Root nodes must be grouping categories.
//    - Exception: if you really want a root item to represent an EverythingSearch prop and want it to have no children, give it
//      a different key and a single child_option with a) the key of the EverythingSearch prop and b) the same label as the parent option.
//      In this special case, the child option is hidden but it has the same behaviour as all other cases otherwise (toggling the displayed
//      root option toggles the sole, hidden, child option)
//  - the hierarchy can have arbitrary depth (correspnding to deeper nested option lists), given that the above rules are followed
const complete_option_hierarchy = {
  org_options: {
    label: text_maker("orgs"),

    child_options: {
      include_orgs_normal_data: {label: text_maker("include_orgs_normal_data_label")},
      include_orgs_limited_data: {label: text_maker("include_orgs_limited_data_label")},
    },
  },

  crso_and_program_options: {
    label: text_maker("crso_and_prog_label"),

    child_options: {
      include_crsos: {label: text_maker("core_resps")},
      include_programs: {label: text_maker("programs")},
    },
  },

  tag_options: {
    label: text_maker("tag_categories"),

    child_options: {
      include_tags_goco: {label: text_maker("goco_tag")},
      include_tags_hi: {label: text_maker("hi_tag")},
      include_tags_hwh: {label: text_maker("hwh_tag")},
      include_tags_wwh: {label: text_maker("wwh_tag")},
    },
  },

  other_options: {
    label: text_maker("other_options_label"),

    child_options: {
      include_glossary: {label: text_maker("glossary")},
      include_tables: {label: text_maker("metadata")},
    },
  },
};

export class AdvancedSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...props.initial_configs };
  }
  render(){
    const optional_configs = this.state;

    const { 
      everything_search_config,
      invariant_configs,
    } = this.props;

    const include_configs = {
      ...optional_configs,
      ...invariant_configs,
    };

    const option_node_to_component = (option_node, option_key) => {
      const is_invariant = _.chain(invariant_configs).keys().includes(option_key).value();
      const all_children_are_invariant = !_.isEmpty(option_node.child_options) && 
        _.chain(option_node.child_options).keys().without(..._.keys(invariant_configs)).isEmpty().value();

      if (is_invariant || all_children_are_invariant){
        return false;
      }

      if ( !_.isEmpty(option_node.child_options) ){
        const has_checked_child_option = _.chain(option_node.child_options)
          .map( (child_node, child_key) => optional_configs[child_key] )
          .some()
          .value();

        const has_children_to_display = !(
          _.size(option_node.child_options) === 1 &&
          _.chain(option_node.child_options).map("label").first().value() === option_node.label
        );

        return (
          <div key={option_key}>
            { ( !window.is_a11y_mode || (window.is_a11y_mode && !has_children_to_display) ) &&
              <CheckBox
                label={option_node.label}
                active={has_checked_child_option}
                container_style={{ padding: 3 }}
                onClick={
                  () => this.setState(
                    _.chain(option_node.child_options)
                      .map( (child_node, child_key) => [child_key, !has_checked_child_option] )
                      .fromPairs()
                      .value()
                  )
                }
              />
            }
            { has_children_to_display &&
              <ul style={{listStyle: 'none'}}>
                { _.map(
                  option_node.child_options,
                  (option_node, option_key) => (
                    <li key={option_key}>
                      {option_node_to_component(option_node, option_key)}
                    </li>
                  )
                )}
              </ul>
            }
          </div>
        );
      } else {
        const should_be_displayed = _.chain(optional_configs)
          .keys()
          .includes(option_key)
          .value();
        
        if (should_be_displayed){
          return <CheckBox
            container_style={{ padding: 3 }}
            key={option_key}
            label={option_node.label}
            active={optional_configs[option_key]}
            onClick={ () => 
              this.setState({
                [option_key]: !optional_configs[option_key],
              })
            }
          />;
        }
      }
    };

    return(
      <div>
        <div className='col-md-12' >
          <EverythingSearch {...{...everything_search_config, ...include_configs}} />
        </div>
        <div className="col-md-12">
          <Details
            summary_content={text_maker("advaced_search_title")}
            persist_content={true}
            content={
              <fieldset>
                <legend>{text_maker("advanced_search_description")}:</legend>
                <div className="advanced-search-options">
                  { _.map(
                    complete_option_hierarchy,
                    option_node_to_component
                  )}
                </div>
              </fieldset>
            }
          />
        </div>
      </div>  
    );
  }
}