import gql from 'graphql-tag';
import { text_maker } from '../models/text.js';

import { LoadingHoc } from '../graphql_utils.js';

import {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} from '../gen_expl/hierarchy_tools.js';


const fragments = gql`
fragment result_info on RppEntity {
  name
  id
  results(doc: $doc) {
    id
    name
    indicators(doc: $doc) {
      id
      name
      planned_target_str
      actual_target_str
      status_key
      target_year
      explanation
    }
  }
}
`;


const query = gql`
query ResultTreemapQuery($dept_code: String!, $doc:String!, $lang: String!){
  root(lang: $lang){
    org(dept_code: $dept_code){
      programs {
        ...result_info
        sub_programs {
          ...result_info
          sub_programs {
            ...result_info
          }
        }
      }
    }
  }
}
${fragments}
`;

const obj_to_node_mapper = level => ({name, id, sub_programs, results, indicators}) => ({
  id: id,
  data: {
    name,
    level, 
  },
  //hacky temp property used to generate hierarchy
  unmapped : {
    sub_programs,
    results,
    indicators,
  },
});

function data_to_props({ root: { org: { programs  }} }){
  const root = {
    root: true,
    id: "root",
    data: {},
  }
  const d3_h7y = d3.hierarchy(root, node => {
    if(node === root){
      return _.map(programs,obj_to_node_mapper("program"));
    }
    else {
      const level = _.get(node, "data.level");
      let children;
      switch(level){
        case "program": 
          children = _.chain(node.unmapped.results)
            .map(obj_to_node_mapper("result"))
            .concat(_.map(node.unmapped.sub_programs, obj_to_node_mapper("sub_program")))
            .value();
          delete node.unmapped;
          return children;

        case "sub_program":
        case "sub_sub_program":
          children = _.chain(node.unmapped.results)
            .map(obj_to_node_mapper("result"))
            .concat(_.map(node.unmapped.sub_programs, obj_to_node_mapper("sub_sub")))
            .value();
          delete node.unmapped;
          return children;

        case "result":
          children = _.map(node.unmapped.indicators, obj_to_node_mapper("indicator"));
          delete node.unmapped;
          return children;

        case "indicator": 
          delete node.unmapped;
          return null;

        default: 
          return null;
      }
    }
  });

  const unfiltered_h7y = convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);
  
  //filter out branches without indicator leaves
  const filtered_h7y = filter_hierarchy(
    unfiltered_h7y, 
    node => _.get(node, "data.level") === "indicator",
    {}
  );

  return {
    flat_nodes: filtered_h7y,
  };

};


const get_type_header = node => {
  const level = _.get(node, "data.level");
  switch(level){
    case 'sub_program':
      return text_maker('sub_programs');

    case 'sub_sub_program': 
      return text_maker('sub_sub_programs');

    case 'result':
      return text_maker("results");

    default:
      return null;
  }
};


class ResultTreeMapContainer extends React.Component {
  render(){
    const { 
      data,
      gql_props: { 
        refetch,
        variables,
        loading,
      },
    } = this.props;
    
    if(loading){
      return "Loading...";
    }

    return (
      <div>
        <button onClick={()=>refetch({...variables, doc: "dp17"})}> refetch </button>
        <header> Content </header>
        <div>
          { JSON.stringify(data) }
        </div>
      </div>
    );

  }

}


const Component = ({ gql_props : {variables } }) => {
  const Comp = LoadingHoc({
    query,
    variables: _.assign({ doc: "drr16"}, variables),
    data_to_props,
    Component: ResultTreeMapContainer,
  });
  return <Comp />;
}


export const panel_def = {
  key: "result_treemap",
  query: query,
  component: ResultTreeMapContainer,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
  vars: {
    doc: "drr16",
  },
};