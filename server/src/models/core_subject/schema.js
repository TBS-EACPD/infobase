import _ from "lodash";

import { bilingual_field } from "../schema_utils";

const schema = `
  extend type Root {
    orgs: [Org]
    all_orgs: [Org]
    org(dept_code: String, org_id: String): Org 
    program(id: String): Program
    gov: Gov
    crso(id: String): Crso
    subject(level : Level!, id: String!): SubjectI
    org_search(query: String!): [Org]
    program_search(query: String!): [Program]
    crso_search(query: String!): [Crso]
    subject_search_interfaces(query:String!): [SubjectI]
    subject_search_union(query:String!): [SubjectU]
  }
  # sometimes we want a subject to just display a name or a infograph-URL
  interface SubjectI {
    name: String
    id: String
    level: String
    # guid: String
  }
  # sometimes we want access to more subject fields, in these cases we'll need to use inline fragments 
  union SubjectU = Org | Program | Crso
  type Org implements SubjectI {
    id: String
    org_id: String
    dept_code: String
    level: String
    name: String
    legal_title: String
    applied_title: String
    old_applied_title: String
    acronym: String
    mandate: String
    description: String
  
    ministry: Ministry
    ministers: [Minister]
    inst_form: InstForm

    programs: [Program]
    crsos: [Crso]

    eval_url: String
    website_url: String

    enabling_instrument: String
    pas_code: String
    faa_schedule_institutional: String
    faa_schedule_hr_status: String
    auditor: String
    incorp_yr: String
    federal_ownership: String
    end_yr: String
    notes: String
    dp_status: String
    article1_fr: String
    article2_fr: String
  }
  type Program implements SubjectI {
    id: String
    level: String
    name: String
    old_name: String
    description: String
    activity_code: String
    is_active: Boolean
    is_internal_service: Boolean

    org: Org
    crso: Crso      
  }
  type Gov {
    id: String
    name: String
    level: String
  }
  type Crso implements SubjectI {
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

export default function ({ models, loaders, services }) {
  const { Org, Program, Crso } = models;

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

  const subjectTypeResolver = (record) => {
    if (record instanceof Org) {
      return "Org";
    }
    if (record instanceof Crso) {
      return "Crso";
    }
    if (record instanceof Program) {
      return "Program";
    } else {
      return null;
    }
  };
  const subject_search_resolver = async (_x, { query }, { lang }) => {
    const subjects = await services.search_subjects(query, lang);
    return _.map(subjects, "record");
  };

  const resolvers = {
    //These are just here for example sake
    SubjectI: { __resolveType: subjectTypeResolver },
    SubjectU: { __resolveType: subjectTypeResolver },
    Gov: {
      name: bilingual_field("name"),
    },
    Root: {
      org_search: async (_x, { query }, { lang }) => {
        const orgs = await services.search_orgs(query, lang);
        return _.map(orgs, "record");
      },
      program_search: async (_x, { query }, { lang }) => {
        const orgs = await services.search_programs(query, lang);
        return _.map(orgs, "record");
      },
      crso_search: async (_x, { query }, { lang }) => {
        const orgs = await services.search_crsos(query, lang);
        return _.map(orgs, "record");
      },
      subject_search_interfaces: subject_search_resolver,
      subject_search_union: subject_search_resolver,
      all_orgs: () => Org.find({}),
      orgs: () => Org.find({}),
      org: (_x, { dept_code, org_id }) => {
        if (org_id) {
          return org_id_loader.load(org_id);
        } else {
          return org_deptcode_loader.load(dept_code);
        }
      },
      gov: _.constant(gov),
      program: (_x, { id }) => prog_id_loader.load(id),
      crso: (_x, { id }) => crso_id_loader.load(id),
      subject: (_x, { level, id }) => {
        switch (level) {
          case "gov":
            return gov;

          case "org":
            return Org.get_by_id(id);

          case "program":
            return Program.get_by_id(id);
        }
      },
    },
    Org: {
      name: bilingual_field("name"),
      description: bilingual_field("description"),
      mandate: bilingual_field("description"),
      id: _.property("org_id"),
      acronym: bilingual_field("acronym"),
      enabling_instrument: bilingual_field("enabling_instrument"),
      notes: bilingual_field("notes"),
      federal_ownership: bilingual_field("federal_ownership"),
      auditor: bilingual_field("auditor"),

      pas_code: (org) => org.pas,

      ministry: () => "TODO",
      ministers: () => ["TODO"],
      inst_form: () => "TODO",

      eval_url: (org, _args, { lang }) => org[`eval_url_${lang}`],
      website_url: (org, _args, { lang }) => org[`dept_website_url_${lang}`],

      programs: (org) =>
        org.dept_code && prog_dept_code_loader.load(org.dept_code),
      crsos: ({ dept_code }) =>
        dept_code && crso_from_deptcode_loader.load(dept_code),
      level: _.constant("Org"),
    },
    Program: {
      name: bilingual_field("name"),
      description: bilingual_field("description"),
      org: (prog) => org_deptcode_loader.load(prog.dept_code),
      crso: (prog) => crso_id_loader.load(prog.crso_id),
      id: _.property("program_id"),
      level: _.constant("Program"),
    },
    Crso: {
      name: bilingual_field("name"),
      description: bilingual_field("description"),
      programs: ({ crso_id }) => prog_crso_id_loader.load(crso_id),
      org: ({ dept_code }) => org_deptcode_loader.load(dept_code),
      id: _.property("crso_id"),
      level: _.constant("Crso"),
    },
    InstForm: {
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
}
