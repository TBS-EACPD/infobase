const {
  Ministry,
  InstForm,
} = require('../models/subject.js');

const { convert_d3_hierarchy_to_explorer_hierarchy } = require('./hierarchy_tools.js');

const FlipMove = require('react-flip-move');
const {
  Select,
} = require('../util_components.js');


const { infograph_href_template } = require('../link_utils.js');
const initial_igoc_state = {
  arrangement: 'ministry-type',
  include_orgs_without_data: true,
};

function create_igoc_hierarchy(){

  const root = {
    root: true,
    id: 'root',
    data: {},
  };

  const flat_nodes = d3.layout.hierarchy().children(node => {
    if(node === root){
      return _.chain(Ministry.get_all())
        .map(min => ({
          id: min.guid,
          data: {
            type: 'ministry',
            subject: min,
            name: min.name,
          },
        }))
        .value();
    } 

    const { 
      id,
      data: {
        type,
        subject,
      },
    } = node;

    switch(type){

      case 'ministry': {
        const min_id = id;

        return _.chain(subject.orgs)
          .groupBy( org => org.inst_form.parent_form.id )
          .map( (group, inst_form_id) => ({
            id: min_id+inst_form_id,
            data: {
              subject: InstForm.lookup(inst_form_id),
              type: 'inst_form_parent',
              name: InstForm.lookup(inst_form_id).name,
            },
            children: group.map( org => ({
              id: org.guid,
              data: {
                subject: org,
                name: org.name,
                type: 'dept',
              }, 
            })),
          }))
          .value()

      }

      case 'inst_form_parent':{
        return node.children; //children is already set up (see above)

      }

      default:
        return null;
    }


  })(root);

  convert_d3_hierarchy_to_explorer_hierarchy(flat_nodes);
  
  return flat_nodes;


}


function igoc_tree_content_renderer({
  node, 
  onToggleNode, 
  children, 
  index,
}){
  const {
    id,
    data: {
      subject,
      type,
    },
  } = node;

  if(id==='root'){
    return (
      <FlipMove
        staggerDurationBy="0"
        duration={500}
        typeName="ul"
        className="list-unstyled colcount-lg-3"
      > 
        {_.map(children, ({element, node}) => 
          <li key={node.id}>
            {element}
          </li>
        )}
      </FlipMove>
    );
  }

  if(type === "ministry"){

    return <div 
      style={{
        width:'100%',
        display: 'inline-block',
      }}
    >
      <div className="panel panel-info">
        <div className="panel-heading">
          <h3 className="panel-title">
            {subject.name}  ({ _.chain(node.children).map('children').flatten().value().length })
          </h3> 
        </div>
        <div className="panel-body">
          <ul className="list-unstyled">
            {_.map( node.children,  inst_form_node  => 
              <div>
                <header><strong>{ inst_form_node.data.name } ({ inst_form_node.children.length }) </strong></header>
                <ul className="mrgn-bttm-sm nav nav-pills nav-stacked">
                  {_.map(inst_form_node.children, org_node => 
                    <li key={org_node.id}>
                      <a href={infograph_href_template(org_node.data.subject)}> {org_node.data.subject.name} </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </ul>
        </div>
      </div>
      
    </div>
  } else if(type ==='dept'){
    return node.name;
  } else { 
    return null;
  }

}

const igoc_sidebar = () => (
  <div>
    <div>
      <label>
        Arrange by 
        <Select
          selected='min'
          options={[
            {id: 'min', display: 'Ministerial Portofolio'},
            {id: 'type', display: 'Type (Institutional Forms)'},
          ]}
          style={{fontSize:'1em'}}
          className="form-control"
        />
      </label>
    </div>

    <div className="checkbox">
      <label>
        <input type="checkbox" value=""/>
          Only show organizations with data
      </label>
    </div>

    <ul style={{listStyle:'none',paddingLeft:'20px'}}>
      <li>
        <div className="checkbox">
          <label>
            <input type="checkbox" value="" />
              Ministerial Departments
          </label>
        </div>
      </li>
      <li>
        <div className="checkbox">
          <label>
            <input type="checkbox" value=""/>
              Crown Corporations
          </label>
        </div>
      </li>
      <li>
        <div className="checkbox">
          <label>
            <input type="checkbox" value=""/>
            ...More
          </label>
        </div>
      </li>
    </ul>
  </div>
);

const igoc_scheme = {
  key: 'igoc',
  tree_renderer: igoc_tree_content_renderer,
  title: 'organizations',
  get_base_hierarchy_selector: () => ()=> create_igoc_hierarchy(),
  get_sidebar_content: igoc_sidebar,
  get_props_selector: () => _.constant({}),
  reducer: (state=initial_igoc_state, action )=> {
    const { type, payload } = action;
    //convention: to toggle a piece of state, use toggle_<key>
    if(type.indexOf('igoc_toggle_') > -1){
      const key = type.split('toggle_')[1];
      return _.immutate(state, { [key] : !state[key] })
    } else if(type === 'igoc_set_arrangement'){
      return _.immutate(state, { arrangement: payload });
    } else {
      return state;
    }
  },
  dispatch_to_props: dispatch => ({

  }),
  initial_state: initial_igoc_state,
  get_filter_func_selector: () => ()=>  _.identity,
};

module.exports = exports = {
  igoc_scheme,
}
