import _ from 'lodash';
import { 
  bilingual_field, 
} from '../schema_utils';



const schema = `
  extend type Root {
    orgs: [Org]
    all_orgs: [Org]
    org(dept_code: String, org_id: String): Org 
    program(id: String): Program
    gov: Gov
    crso(id: String): Crso
    subject(level : Level!, id: String!): SubjectI
  }
  # sometimes we want a subject to just display a name or a infograph-URL
  interface SubjectI {
    name: String
    id: String
    level: String
    # guid: String
  }
  # sometimes we want access to more subject fields, in these cases we'll need to use inline fragments 
  union SubjectU = Org | Program | Gov
  type Org implements SubjectI {
    id: String
    org_id: String
    dept_code: String
    level: String
    name: String
    legal_title: String
    applied_title: String
    acronym: String
    mandate: String
    description: String
  
    ministry: Ministry
    ministers: [Minister]
    inst_form: InstForm

    programs: [Program]
    crsos: [Crso]

    dp_url: String
    qfr_url: String
    eval_url: String
    website_url: String

    enabling_instrument: String
    pas_code: String
    faa_schedule_institutional: String
    faa_schedule_hr_status: String
    auditor: String
    incorp_yr: String
    fed_ownership: String
    end_yr: String
    notes:String
    dp_status: String
    article_1: String
    article_2: String
  }
  type Program implements SubjectI {
    id: String
    level: String
    name: String
    is_internal_service: Boolean
    description: String
    activity_code: String
    is_active: Boolean
    is_internal_service: Boolean

    org: Org
    crso: Crso      
  }
  type Gov implements SubjectI  {
    id: String
    name: String
    level: String
  }
  type Crso {
    id: String
    name: String
    level: String
    description: String
    is_active: Boolean

    org: Org
    programs: [Program]
  }

  enum Level {
    gov
    org
    program
    crso
  }

  type InstForm {
    name: String
    id: String
  }

  type Ministry {
    name: String
    orgs: [Org]
    id: String
  }

  type Minister {
    name: String
    id: String
  }


`;


export default function({models,loaders}){

  const { Org, Program, Crso } = models;


  //TODO: figure out how these loaders cache stuff and whether we should really be creating new loaders in the root resolver and attaching them to context
  // const org_loader = new DataLoader(async dept_codes => {
  //   const uniq_deptcodes = _.uniq(dept_codes);
  //   const orgs= await Org.find({
  //     dept_code: { "$in": uniq_deptcodes },
  //   });
  //   const orgs_by_deptcode = _.keyBy(orgs,"dept_code");
  //   return _.map(dept_codes, code => orgs_by_deptcode[code]);
  // })

  const { 
    org_deptcode_loader,
    org_id_loader,
    prog_dept_code_loader,
    prog_crso_id_loader,
    prog_id_loader,
    crso_from_deptcode_loader,
    crso_id_loader,
  } = loaders;

  const gov = {
    guid: "gov_gov",
    level: "gov",
    id: "gov",
    name_en: "Government",
    name_fr: "Gouvernment",
  };

  const resolvers = {
    Gov: {
      name: bilingual_field("name"),
    },
    Root: {
      all_orgs: () => Org.find({}),
      orgs: ()=> Org.find({}),
      org: (_x, {dept_code, org_id}) => {
        if(org_id){
          return org_id_loader.load(org_id);
        } else {
          return org_deptcode_loader.load(dept_code);
        }
      },
      gov: _.constant(gov),
      program: (_x, {id}) => prog_id_loader.load(id),
      crso: (_x, {id}) => crso_id_loader.load(id),
      subject: (_x, { level, id }) => {
        switch(level){
          case 'gov':
            return gov;

          case 'org':
            return Org.get_by_id(id);

          case 'program':
            return Program.get_by_id(id);

        }
      }, 
    },
    Org: {
      name: bilingual_field("name"),
      description: bilingual_field("mandate"),
      mandate:  bilingual_field("mandate"),
      id: _.property("org_id"),
      acronym: bilingual_field("abbr"),
      enabling_instrument: bilingual_field("enabling_instrument"),
      notes: bilingual_field("notes"),
      fed_ownership: bilingual_field("notes"),
      auditor: bilingual_field("auditor"),

      dp_url: (org, _args, {lang}) => org.dp_url(lang),
      qfr_url: (org, _args, {lang}) => org.qfr_url(lang),
      eval_url: (org, _args, {lang}) => org.eval_url(lang),
      website_url: (org, _args, {lang}) => org.website_url(lang),

      programs: org => org.dept_code && prog_dept_code_loader.load(org.dept_code),
      crsos: ({dept_code}) => dept_code && crso_from_deptcode_loader.load(dept_code),

    },
    Program: {
      name: bilingual_field("name"),
      description: bilingual_field("desc"),
      org: prog => org_deptcode_loader.load(prog.dept_code),
      crso: prog => crso_id_loader.load(prog.crso_id),
      id: _.property('program_id'),

    },
    Crso: {
      name: bilingual_field("name"),
      description: bilingual_field("desc"),
      programs: ({crso_id}) => prog_crso_id_loader.load(crso_id),
      org: ({ dept_code }) => org_deptcode_loader.load(dept_code),  
      id: _.property('crso_id'),
    },
    SubjectI :{
      __resolveType(obj){
        const level = _.get(obj,'level');
        if(level === 'program'){ 
          return "Program";
        }
        else if(level === "org"){
          return "Org";
        }
        else if(level === "gov"){
          return "Gov";
        }
      },
    },
    InstForm :{
      name: bilingual_field("name"),
    },
    Ministry: {
      name: bilingual_field("name"),
    },
    Minister: {
      name: bilingual_field("name"),
    },
  };

  return {
    schema,
    resolvers,
  };
};