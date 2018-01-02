const classNames = require('classnames');
const {
  Subject : {
    Gov,
  },
  text_maker, 
} = require('../shared.js');

const {
  TextMaker,
} = require('../../util_components.js');

/* 
  This component helps put a subject in context.

  If it's a Department, Program or CR, it will show the department's full inventory,
  placing the active element first. It is recommended that consumers clip the height of this component, 
  since Fisheries and Ocean has like 36 programs! 

  If it's a tag, instead of showing all programs, it will just show ancestors, like so

    GoC
      - Program Tags
        - How we help
          - Contribution

  

  This component was not designed with government-wide in mind.   

*/


const activeStyle = {
  color: '#333333',
  fontWeight: '300',
  padding: '5px',
};

const get_style = ({ active, dead}) => {
  if(active){
    return activeStyle;
  }
  else {
    return null;
  }
};
    
const has_dead_elements = root => {

  if(root.dead){ 
    return true;
  } else if(!_.isEmpty(root.children)){

    return _.chain(root.children)
      .map(child => has_dead_elements(child) )
      .some()
      .value();

  } else {
    return false;
  }


}

const HierarchyPeek = ({root}) => (
  <div> 
    <_HierarchyPeek root={root} />
    { 
      has_dead_elements(root) &&
      <TextMaker text_key="hierarchy_contains_dead_elements" />
    }

  </div>
);



/* Recursive child helper */
const _HierarchyPeek = ({root}) => (
  <div>
    { !root.active ?
    <span className={ classNames(root.dead && 'dead-element') }>
      { 
        root.href ? 
        <a
          href={root.href} 
          style={ get_style(root) }
        >
          {root.level === "crso" ? 
            ((root.cr_or_so === "fw" && !root.dead) ? 
              (window.lang == "en" ? root.name + " (Core Responsibility) " : root.name + " (Responsabilité Essentielle)" )
            : (window.lang == "en" ? root.name + " (Strategic Outcome)" : root.name + " (Résultat Stratégique)" )) 
          : root.name} 
        </a> :
        <span style={get_style(root)}>
          {root.name}
        </span>
      }
    </span> : 
    <span 
      style={ get_style(root) }
      className={ classNames(root.dead && 'dead-element') }
    >
      { root.name }
    </span>
    }
    {root.children && !_.isEmpty(root.children) &&
    <ul>
      {_.map( root.children, (child,index) => 
        <li key={index}><_HierarchyPeek root={child} /> </li>
      )}      
    </ul>
    }
  </div>


)



/*
  Gov
    Min
      Inst forms
        Orgs
*/
const org_external_hierarchy = ({ subject, href_generator }) => {

  const is_subject = subj => subj === subject;

  return {
    name: Gov.name,
    href: href_generator(Gov),
    children: (
      _.isEmpty(subject.min) ? 
      [{ 
        name: subject.name,
        active: true,
      }]: 
      [{ 
        name: `${subject.ministry.name} (${text_maker('ministry')})`,
        children: (
          _.chain(subject.ministry.orgs)
            .filter(node => node.status === 'Active' || is_subject(node) )
            .groupBy('type')
            .toPairs()
            .sortBy( ([type,group]) => _.includes(group, subject) )
            .reverse()
            .map( ([type,orgs]) => ({
              name: type,
              children: _.chain(orgs)
                .sortBy( org => org === subject)
                .reverse()
                .map(org => ({
                  name: org.name,
                  active: subject===org, 
                  href: href_generator(org),
                  dead: _.isEmpty(org.tables),
                }))
                .value(),
            }))
            .value()
        ),
      }]
    ),
  };

} 

/*
  Ministry
    org
      CRSOs
        programs
*/

const org_internal_hierarchy = ({subject, href_generator, show_dead_sos, label_crsos}) => ({
  name: subject.name,
  active: true,
  children: _.chain(subject.crsos)
    .reject( show_dead_sos ? _.constant(false) : 'dead_so' )
    .map(crso => ({
      name: (label_crsos ? crso.singular()+" : " : "") + crso.name,
      cr_or_so: subject.dp_status,
      href: crso.is_cr && href_generator(crso),
      dead: crso.dead_so,
      children: _.chain(crso.programs)
        .map( prog=> ({
          name: prog.name,
          href: href_generator(prog),
          dead: prog.dead_program,
        }))
        .sortBy('dead')
        .value(),
    }))
    .sortBy('dead')
    .value(),
})


const program_hierarchy = ({subject, href_generator, show_siblings, show_uncles, show_cousins, show_dead_sos, label_crsos }) => {
  const is_subject = subj => subj === subject;
  const is_parent = subj => subj === subject.crso;

  return {
    name: Gov.name,
    href: href_generator(Gov),
    children: [{ 
      name: `${subject.dept.ministry.name} (${text_maker('ministry')})`,
      children: [{ //dept
        name: subject.dept.type,
        children: [{ 
          name: subject.dept.name,
          href: href_generator(subject.dept),
          children: ( 
            _.chain(subject.dept.crsos) //CRSO (parent + uncles)
              .filter( show_uncles ? _.constant(true) : is_parent )
              .reject( show_dead_sos ? _.constant(false) : 'dead_so' )
              .sortBy('dead_so')
              .reverse()
              .sortBy( is_parent )
              .reverse()
              .map( crso => ({
                name: (label_crsos ? crso.singular()+" : " : "") + crso.name,
                href: crso.is_cr && href_generator(crso),
                dead: crso.dead_so,
                children: ( 
                  show_cousins || is_parent(crso) ? 
                  _.chain(crso.programs)
                    .filter( show_siblings ? _.constant(true) : is_subject )
                    .map(prog => ({
                      name: prog.name,
                      active : is_subject(prog),
                      href: href_generator(prog),
                      dead: prog.dead_program,
                    }))
                    .sortBy('dead')
                    .reverse()
                    .sortBy('active')
                    .reverse()
                    .value()
                  : null
                ),
              }))
              .value()
          ),
        }],
      }],
    }],
  };
}

/* 
  the following is hacky because we don't know how many levels there are between a tag and government.


*/
const tag_hierarchy = ({subject, showSiblings, showChildren, href_generator }) => {
  const is_subject = subj => subj === subject;


  const leaf_nodes = _.chain( subject.parent_tag.children_tags )
    .filter(showSiblings ? _.constant(true) : is_subject )
    .map( tag => ({
      name: tag.name,
      href: href_generator(tag),
      active: is_subject(tag),
      children: (
        showChildren && 
        is_subject(tag) && 
        _.chain(tag.programs)
          .map(prog => ({
            name: prog.name,
            href: href_generator(prog),
            dead: prog.dead_program,
          }))
          .sortBy('dead')
          .value()
      ),
    }))
    .sortBy('active')
    .reverse()
    .value();

  const parent_node = { 
    name: subject.parent_tag.name,
    children: leaf_nodes,
  };

  let current_structure = parent_node;
  let current_node = subject.parent_tag;
  //[Gov, tagging_scheme, (...intermediate parents), subject ]
  while( current_node.parent_tag ){
    current_structure = {
      name: current_node.parent_tag.name,
      children: [ current_structure ],
    };
    current_node = current_node.parent_tag;
  }

  return {
    name: Gov.name,
    children: [ current_structure ],
  };

}


const crso_hierarchy = ({subject, href_generator, show_siblings, show_uncles, show_cousins, show_dead_sos, label_crsos }) => {
//From Gov to programs under CRSO
  const is_subject = subj => subj === subject;

  return {
    name: Gov.name,
    href: href_generator(Gov),
    children: [{ //ministry
      name: `${subject.dept.ministry.name} (${text_maker('ministry')})`,
      level: "ministry",
      children: [{ //dept
        name: subject.dept.name,
        href: href_generator(subject.dept),
        level: subject.dept.level,
        children: //crso
          _.chain(_.map(_.chain(subject.dept.crsos).value(), crso => ({            
            level: crso.level,
            name: crso.name,
            cr_or_so: crso.dept.dp_status,
            href: crso.is_cr && href_generator(crso),
            active : is_subject(crso),
            dead: crso.dead_so,
            children: //program
              _.chain(_.map(_.chain(crso.programs).value(), prg => ({            
                level: prg.level,
                name: prg.name,
                href: href_generator(prg),
                dead: prg.dead_program,
              })))
                .sortBy('dead').value(),
          })))
            .sortBy('dead').value(),
      }],
    }],
  };
}

const crso_pi_hierarchy = ({subject, href_generator, show_siblings, show_uncles, show_cousins, show_dead_sos, label_crsos }) => {


  return {
    name: Gov.name,
    href: href_generator(Gov),
    children: [{ //ministry
      name: `${subject.dept.ministry.name} (${text_maker('ministry')})`,
      level: "ministry",
      children: [{ //dept
        name: subject.dept.name,
        href: href_generator(subject.dept),
        level: subject.dept.level,
        children: [{ //crso          
          level: subject.level,
          name: subject.name,
          active : true,
          cr_or_so: subject.dept.dp_status,
          href: href_generator(subject),
          children:
              _.chain(_.map(_.chain(subject.programs).value(), prg => ({            
                level: prg.level,
                name: prg.name,
                href: href_generator(prg),
                dead: prg.dead_program,
              }))).sortBy('dead').value(),
        }],
      }],
    }],
  }
}

const crso_gov_hierarchy = ({subject, href_generator, show_siblings, show_uncles, show_cousins, show_dead_sos, label_crsos }) => {

  const is_subject = subj => subj === subject;

  return {
    name: Gov.name,
    href: href_generator(Gov),
    children: [{ //ministry
      name: `${subject.dept.ministry.name} (${text_maker('ministry')})`,
      level: "ministry",
      children: [{ //dept
        name: subject.dept.name,
        href: href_generator(subject.dept),
        level: subject.dept.level,
        children: //crso
          _.map(_.chain(subject.dept.crsos).reject('dead_so').value(), crso => ({            
            level: crso.level,
            name: crso.name,
            href: crso.is_cr && href_generator(crso),
            active : is_subject(crso),
          })),
      }],
    }],
  };
}


module.exports = exports = {
  HierarchyPeek,
  program_hierarchy,
  org_external_hierarchy,
  org_internal_hierarchy,
  tag_hierarchy,
  crso_hierarchy,
  crso_pi_hierarchy,
  crso_gov_hierarchy,
};
