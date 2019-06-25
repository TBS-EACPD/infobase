
const schema = `
  extend type Program{
    program_spending: [ProgramSpending]
    program_fte: [ProgramFte]
  }
  type ProgramSpending{
    program_id: String

    pa_last_year_5_exp: Float
    pa_last_year_4_exp: Float
    pa_last_year_3_exp: Float
    pa_last_year_2_exp: Float
    pa_last_year_exp: Float

    planning_year_1: Float
    planning_year_1_rev: Float
    planning_year_1_spa: Float
    planning_year_1_gross: Float

    planning_year_2: Float
    planning_year_2_rev: Float
    planning_year_2_spa: Float
    planning_year_2_gross: Float

    planning_year_3: Float
    planning_year_3_rev: Float
    planning_year_3_spa: Float
    planning_year_3_gross: Float
  }
  type ProgramFte{
    program_id: String,
    pa_last_year_5: Float,
    pa_last_year_4: Float,
    pa_last_year_3: Float,
    pa_last_year_2: Float,
    pa_last_year: Float,
    pa_last_year_planned: Float,

    planning_year_1: Float,
    planning_year_2: Float,
    planning_year_3: Float,
  }
`;


export default function({models, loaders}){
  const {
    program_spending_program_id_loader,
    program_fte_program_id_loader,
  } = loaders;

  const resolvers = {
    Program: {
      program_spending: (prog) => program_spending_program_id_loader.load(prog.program_id),
      program_fte: (prog) => program_fte_program_id_loader.load(prog.program_id),
    },
  };

  return {
    schema,
    resolvers,
  };
}
