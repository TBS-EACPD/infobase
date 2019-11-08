import { get_resources_for_subject } from './resource_utils.js';
import { Subject } from '../models/subject.js';
import { 
  Result, 
  SubProgramEntity,
} from '../models/results.js';
import { filter_hierarchy, convert_d3_hierarchy_to_explorer_hierarchy } from './hierarchy_tools.js';

const { Dept } = Subject;

const indicator_date_sorter = (ind) => ind.target_year ? ind.target_year + ind.target_month/12 : Infinity;
function result_to_node(result, parent_id, doc){
  return {
    data: {
      type: result.is_dr ? 'dr' : 'result',
      name: result.name,
      result,
      contributing_programs: result.contributing_programs,
    },
    id: `${parent_id}-${result.guid}`,
  };
}

// vv delete on drr17 exit
const get_sub_program_resources = (sub_program, doc) => ({
  spending: (
    doc === "drr17" ?
      sub_program.spend_pa_last_year :
      sub_program.spend_planning_year_1
  ),
  ftes: (
    doc === "drr17" ? 
      sub_program.fte_pa_last_year :
      sub_program.fte_planning_year_1
  ),
});
// ^^ delete on drr17 exit


export function create_full_results_hierarchy({subject_guid, doc, allow_no_result_branches}){


  const get_resources = subject => get_resources_for_subject(subject, doc);

  const root_subject = Subject.get_by_guid(subject_guid);
  let root;
  if( root_subject){

    const root_type = (
      _.includes(['program', 'dept', 'tag'], root_subject.level) ?
      root_subject.level : 
      (
        //it's a CRSO
        root_subject.is_cr ? 
        'cr' : 
        'so'
      )
    );


    root = {
      id: "root",
      root: true,
      data: {
        subject: root_subject,
        name: root_subject.name,
        type: root_type,
      },
    };

  } else {

    root = {
      root: true,
      id: 'root',
      data: {},
    };

  }
  const d3_hierarchy = d3.hierarchy(root, node => {

    if(!_.isEmpty(node.children)){
      return node.children; //if children is already defined, use it.
    }

    if(node === root && !root_subject){//if there is no root subject, we use all departments as children of the root.

      return _.chain(Dept.get_all())
        .filter('dp_status')
        .map(org => ({
          id: org.guid,
          data: {
            subject: org,
            name: org.name,
            type: 'dept',
          }, 
        }))
        .value();

    } 

    const {
      id: parent_id,
      data: {
        type,
        subject,
        result,
      },
    } = node;

    switch(type){

      case 'tag': {

        const nodes_by_program_by_dept = _.chain(subject.programs)
          .groupBy(prog => prog.dept.id)
          .map( (progs,dept_id) => {
            const org = Dept.lookup(dept_id);
            const node_id = `${parent_id}-${org.guid}`;
            return {
              id: node_id,
              isExpanded: false,
              data: {
                name: org.name,
                subject: org,
                type: 'dept',
              },
              children: _.map(progs, prog => ({
                id: `${node_id}-${prog.guid}`,
                data: {
                  name: `${prog.name}`,
                  subject: prog,
                  type: 'program',
                }, 
              })),
            };

          })
          .value();

        return nodes_by_program_by_dept;

      
      }
      case 'dept': {

        // vv delete on drr17 exit
        if (doc === 'drr17' && !subject.is_first_wave){
          // for PAA structures, the SO adds an annoying layer of drilling down for no reason
          return subject.programs.map(prog => ({
            id: prog.guid,
            isExpanded: false,
            data: {
              subject: prog,
              type: 'program',
              name: prog.name,
              resources: get_resources(prog),
            }, 
          }));
        }
        // ^^ delete on drr17 exit

        return _.chain(subject.crsos)
          .filter('is_cr')
          .map(crso => ({
            id: crso.guid,
            isExpanded: false,
            data: {
              subject: crso,
              type: 'cr',
              name: crso.name,
              resources: get_resources(crso),
            }, 
          }))
          .value();
      }

      case 'cr': {

        const programs = subject.programs.map(prog => ({
          id: `${parent_id}-${prog.guid}`,
          data: {
            name: prog.name,
            subject: prog,
            type: 'program',
            resources: get_resources(prog),
          }, 
        }));

        const results = _.map(
          Result.get_entity_results(subject.id),
          result => result_to_node(result, parent_id, doc)
        );
    
        return results.concat(programs);

      }

      case 'so' : {
        const programs = subject.programs.map(prog => ({
          id: `${parent_id}-${prog.guid}`,
          data: {
            name: prog.name,
            subject: prog,
            type: 'program',
            resources: get_resources(prog),
          }, 
        }));

        const results = _.chain(Result.get_entity_results(subject.id))
          .reject(root_subject.level === subject ? _.constant(false) : 'is_dr' ) //DRs will be attached at the dept level. Only ever attach them to the cr if they are the root.
          .map( result => result_to_node(result, parent_id, doc) )
          .value();
    
        return results.concat(programs);

      }

      case 'program': {
        const program_results = Result.get_entity_results(subject.id);

        const result_nodes = _.map(program_results, result => result_to_node(result, parent_id, doc) );

        // vv delete on drr17 exit
        const subs = SubProgramEntity.sub_programs(subject.id);
        const sub_program_nodes = _.map(subs, sub => ({
          id: `${parent_id}-${sub.guid}`,
          data: {
            name: sub.name,
            subject: sub, 
            type: 'sub_program',
            resources: get_sub_program_resources(sub, doc),
            description: sub.description,
          },
        }));
        // ^^ delete on drr17 exit

        return result_nodes.concat(sub_program_nodes);
      }

      // vv delete on drr17 exit
      case 'sub_program': {
        const results = _.map(
          Result.get_entity_results(subject.id),
          result => result_to_node(result, parent_id, doc)
        );
        const sub_subs = _.map(
          SubProgramEntity.sub_programs(subject.id),
          subsub => ({
            id: `${parent_id}-${subsub.guid}`,
            data: {
              subject: subsub,
              name: subsub.name,
              type: 'sub_sub_program',
              resources: get_sub_program_resources(subsub, doc),
              description: subsub.description,
            },
          })
        );
        return results.concat(sub_subs);

      }

      case 'sub_sub_program': {
        return _.map(
          Result.get_entity_results(subject.id),
          result => result_to_node(result, parent_id, doc)
        );

      }
      // ^^ delete on drr17 exit

      case 'result':
      case 'dr':
        return _.chain(result.indicators)
          .filter({doc})
          .sortBy(indicator_date_sorter)
          .map(indicator => ({
            id: `${parent_id}-${indicator.id}`,
            data: {
              indicator,
              type: 'indicator',
            },
          }))
          .value();

      default:
        return null;
    }
  });

  const unfiltered_flat_nodes = convert_d3_hierarchy_to_explorer_hierarchy(d3_hierarchy);


  //eliminate all nodes without result-descendants
  const flat_nodes = filter_hierarchy(
    unfiltered_flat_nodes, 
    node => (
      node.data.type === 'indicator' && 
      node.data.indicator.doc === doc
    ),
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;

}