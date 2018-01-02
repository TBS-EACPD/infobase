const { 
  Dept,
  InstForm,
} = require('../models/subject.js');

const { population_groups } = require('../models/businessConstants.js');

const { convert_d3_hierarchy_to_explorer_hierarchy } = require('../gen_expl/hierarchy_tools.js');

const org_to_node = (subject, parent_id="a") => ({
  id: `${parent_id}-${subject.id}`,
  data:{
    type:'org',
    name: subject.legal_name,
    subject,
  },
});

const parent_inst_form_sort_order = [
  "min_dept_p",
  "dept_corp_p",
  "dept_agency_p",
  "spec_op_agency_p",
  "parl_ent_p",
  "crown_corp_p",
  "other_p",
  "corp_int",
];

const pop_group_node = ({ pop_group_key, children, isExpanded }) => ({
  id: pop_group_key,
  data: {
    name: population_groups[pop_group_key].text,
  },
  children,
  isExpanded,
});

const create_igoc_hierarchy = grouping => {

  let nodes;
  switch(grouping){
    case 'portfolio': {
      nodes = _.chain(Dept.get_all())
        .filter('ministry.name')
        .groupBy('ministry.name')
        .map( (orgs,min_name)=>({
          id: min_name,
          data: {
            type:'ministry',
            name: min_name,
          },
          children: _.chain(orgs)
            .reject('is_dead')
            .map(org => org_to_node(org, min_name))
            .sortBy('data.name')
            .value(),

        }))
        .sortBy('data.name')
        .value()
      break;
    }
    case 'inst_form': {
      nodes = _.chain(Dept.get_all())
        .reject("is_dead")
        .groupBy('inst_form.parent_form.id')
        .map( (orgs, parent_form_id) => ({
          id: parent_form_id,
          data: {
            name: InstForm.lookup(parent_form_id).name,
            type: 'inst_form',
          },
          children: _.chain(orgs)
            .groupBy('inst_form.id')
            .map( (orgs,type_id) => ({
              id: type_id,
              data: {
                type:'inst_form',
                name: InstForm.lookup(type_id).name,
              },
              children: _.chain(orgs)
                .map(org => org_to_node(org, type_id) )
                .sortBy('data.name')
                .value(),
            }))
            .value(),
        }))
        .each(parent_form_node => { 

          if(parent_form_node.children.length === 1){
            //if an inst form grouping just contains a single inst form, 'skip' the level
            const { children } = parent_form_node.children[0]; 
            parent_form_node.children = children;
          } else {
            parent_form_node.isExpanded = true;
          }
        })
        .sortBy(parent_form_node => _.indexOf(parent_inst_form_sort_order, parent_form_node.id) )
        .value();
      break;
    }
    case 'historical': {
      nodes = _.chain(Dept.get_all())
        .filter('is_dead')
        .map(org => org_to_node(org, "root") )
        .sortBy(node=> +node.data.subject.end_yr)
        .reverse()
        .value();
          
      break;
    }
    case 'pop_group': {
      /*
        fps
          cpa
            min_depts
            cpa_other_portion
          separate_agencies
        na
      */
      const orgs = _.filter(Dept.get_all(), 'pop_group_gp_key');

      const cpa_min_dept_node = pop_group_node({ 
        pop_group_key: "cpa_min_depts",
        children: _.chain(orgs)
          .filter({granular_pop_group_key: "cpa_min_depts"})
          .map(org_to_node)
          .value(),
      });
    
      const cpa_other_portion_node = pop_group_node({ 
        pop_group_key: "cpa_other_portion",
        children: _.chain(orgs)
          .filter({granular_pop_group_key: "cpa_other_portion"})
          .map(org_to_node)
          .value(),
      });

      const cpa_node = pop_group_node({
        pop_group_key: "cpa",
        children: [ cpa_min_dept_node, cpa_other_portion_node ],
        isExpanded: true,
      });

      const separate_agencies_node = pop_group_node({
        pop_group_key: "separate_agencies",
        children: _.chain(orgs)
          .filter({pop_group_parent_key: "separate_agencies"})
          .map(org_to_node)
          .value(),
      });

      const fps_node = pop_group_node({
        pop_group_key: "fps",
        children: [cpa_node, separate_agencies_node],
        isExpanded: true,
      });

      const na_node = pop_group_node({
        pop_group_key: "na",
        children: _.chain(orgs)
          .filter({pop_group_gp_key: "na"})
          .map(org_to_node)
          .value(),
      });

      nodes = [fps_node, na_node]; 
      break;
    }
    case 'all':
    default: {
      nodes = _.chain(Dept.get_all())
        .map(org => org_to_node(org,'root'))
        .sortBy('data.name')
        .value();
      break;
    }
  }

  const root = {
    id: 'root',
    root: true,
    data: {
      type:'root',
    },
    children: nodes,
  };

  const d3_hierarchy = d4.hierarchy(root, node=>node.children );
  const flat_nodes = convert_d3_hierarchy_to_explorer_hierarchy(d3_hierarchy);


  return flat_nodes;
  
}

module.exports = exports = {
  create_igoc_hierarchy,
}
