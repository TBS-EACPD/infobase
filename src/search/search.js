'use strict';
require('./search.css')
const ROUTER = require('../core/router.js');
const {
  escapeSingleQuotes,
} = require('../core/utils.js');
const {
  all_orgs_without_gov,
  orgs_with_data_with_gov,
  all_orgs_with_gov,
  how_we_help : hwh_search_config,
  glossary_lite: glossary_lite_search_config,
  gocos: goco_search_config,
  datasets: table_search_config,
  programs: program_search_config,
  crsos: crso_search_config,
} = require('./search_configs.js');

const {text_maker} = require('../models/text.js');
const { reactAdapter } = require('../core/reactAdapter.js');
const classNames = require('classnames');

const search_template = ({search_text, large})=> (
  `
  <span class='${classNames("form-inline", large && "full-width-search")}'>
    <input 
      style='vertical-align: top;'
      class='${classNames("typeahead", "form-control",  "input-lg")}'
      type='text' 
      autocomplete="off"  
      placeholder='${escapeSingleQuotes(search_text)}'>
    </input>
    <div class="a11y_select"></div>
  </span>
`);

const add_search_glyphicon = (container) => {
  container.querySelector('.twitter-typeahead').insertAdjacentHTML('beforeend', `
      <div class="search-glyphicon-container">
        <span 
          aria-hidden="true"
          class="glyphicon glyphicon-search glyphicon--desktop"
        ></span>
      </div>`);
}

class A11YSearch extends React.Component {
  constructor(){
    super();
    this.state = {
      item : null,
      query: "",
    }
  }
  render(){
    const { 
      onSelect, 
      get_choices_for_query,
    } = this.props;
    const choices_by_category = (
      _.isEmpty(this.state.query) ?
      null :
      get_choices_for_query(this.state.query) 
    ); 
       

    return <div>
      <form
        onSubmit={ evt=> {
          evt.preventDefault()
          evt.stopPropagation()
          this.refs.selection.focus();
        }}
      >
        <input
          ref="input_node"
          type="text"
          placeholder="search for an organization"
          value={this.state.query}
          onChange={evt => { 
            this.setState({query: evt.target.value})
          }}
        />
      </form>
      <div
        tabIndex={-1}
        ref="selection"
      >
        { _.isEmpty(choices_by_category) ? 
          <p> No search results. Please search using the above input </p> :
          <section>
            <header> Search results </header>
            <ul>
              {_.map(choices_by_category, ({html,children}) => (
                <li>
                  <header 
                    dangerouslySetInnerHTML={{ __html:html }} 
                  />
                  <ul>
                    {_.map(children, ({item, html})=> 
                      <li>
                        <a 
                          href="#"
                          onClick={evt=> { 
                            evt.preventDefault();
                            evt.stopPropagation();
                            window.event && window.event.preventDefault();
                            onSelect(item); 
                          }}
                          dangerouslySetInnerHTML={{
                            __html: html, 
                          }}
                        />
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </section> 
        }
        <button
          onClick={()=>{ 
            this.refs.input_node.focus()
          }}
        >
          Perform another search 
        </button>
      </div>
    </div>

  }
}

//general typeahead component to be wrapped by DeptSearch, DeptGovSearch, GlossarySearch, etc. 
function autoComplete({container, search_configs, onSelect, placeholder, minLength, large  }){
  minLength = minLength || 3;
  placeholder = placeholder || text_maker("org_search");

  const nested_search = search_configs.length > 1;
  
  container.innerHTML = `
    <div 
      aria-hidden="true"
      class="${classNames("non-a11y", nested_search && 'multi-search')}"
    >
      ${search_template({search_text: placeholder, large})}
    </div>
    <div class="sr-only a11y_fallback">
    </div>
  `;

  const sources = _.map(search_configs, ({query_matcher, templates: { header, suggestion, empty}}) => {
    const get_matches_for_query = query_matcher();
    return {
      source: (query_str,cb) => {
        cb(get_matches_for_query(query_str));
      },
      templates : {
        //a 'header' will be shown to group results by source. These only make sense when there are more than 1 sources.
        header: nested_search ? `<header>${header()}</header>` : undefined,
        suggestion : item => `<a href="#">${suggestion(item)}</a>`,
      },
    };
  });

  const $input = $(container.querySelector('.non-a11y input'))
  $input.typeahead( "destroy", "NoCached");
  $input.typeahead(
    {
      hint:true,
      highlight:true,
      minLength,
    },
    ...sources //typeahead expects sources to be spread like functions arguments
  )
    .on('typeahead:selected', ( e, datum ) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.event) {
        window.event.preventDefault();
      }
      onSelect(datum);
    })
  $input.parent().on("click", function(e){
    e.preventDefault();
    e.stopPropagation();
  });
  
  add_search_glyphicon(container);

  reactAdapter.render(
    <A11YSearch 
      onSelect={item => { 
        //if onSelect triggers the router, 
        //it will unmount this component in its own handler, causing an exception 
        //(React DOM tree root should always have a node reference.)
        //using async seems to solve this.
        setTimeout(()=> { 
          onSelect(item) 
        });
      }}
      get_choices_for_query={query => _.chain(search_configs)
        .map(({query_matcher, templates: { header, suggestion }}) => {
          const get_matches_for_query = query_matcher();
          return {
            html: header(),
            children: _.map(get_matches_for_query(query), item => ({
              html: suggestion(item),
              item,
            })),
          };
        })
        .reject(({children}) => _.isEmpty(children) )
        .value()
      }
    />,
    container.querySelector('.a11y_fallback')
  );
}


function deptSearch(container, options={}){
  const {
    include_orgs_without_data,
    href_template, 
  } = options;

  let { onSelect } = options;
  
  if(!onSelect && href_template){
    onSelect = item => { 
      ROUTER.navigate( href_template(item), { trigger: true });
    }
  }

  let search_config = orgs_with_data_with_gov;
  if(include_orgs_without_data){
    search_config = all_orgs_without_gov;
  }
    
  return autoComplete({
    container, 
    search_configs: [ search_config ],
    onSelect,
  });
}


function everythingSearch(container, options={}){
  const {
    href_template, 
  } = options;

  //by default just includes organizations
  let { 
    onSelect,
    include_tags,
    include_tables,
    include_programs,
    include_glossary,
    include_crsos,
    org_scope,
  } = options;


  const org_search_config = {
    orgs_with_data_with_gov,
    all_orgs_without_gov,
    all_orgs_with_gov,
  }[org_scope || "orgs_with_data_with_gov"];
  
  if(!onSelect && href_template){
    onSelect = item => { 
      ROUTER.navigate( href_template(item), { trigger: true });
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
    
  return autoComplete({
    container, 
    search_configs,
    onSelect,
    large: !!options.large,
    placeholder: options.placeholder || text_maker('everything_search_placeholder'),
  });
}

module.exports = exports = { 
  autoComplete, 
  deptSearch,
  everythingSearch,
};
