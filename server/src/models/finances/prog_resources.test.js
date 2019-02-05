const query = `
query ($program_id: String, $dept_code: String){
  root(lang: "en"){
    program(id: $program_id){
      program_spending_data {
        ...prog_spend_test
      }
      program_fte_data {
        ...prog_fte_test
      }
    }
    org(dept_code: $dept_code){
      program_spending_data {
        ...prog_spend_test
      }
      program_fte_data {
        ...prog_fte_test
      }
    }
  }
}


fragment prog_spend_test on ProgramSpendingData {

  totals {
    amount
    year
  }

  basic_spend_trend {
    pa_last_year_exp
    pa_last_year_auth
    pa_last_year_planned
    planning_year_1
    historical_change_pct
    avg_all
    avg_planned
    avg_historical
  }

}

fragment prog_fte_test on ProgramFteData {


  totals {
    amount
    year
  }

  basic_fte_trend{
    pa_last_year
    historical_change_pct
    planned_change_pct
    avg_all
    avg_planned
    avg_historical
  }
}`


const { execQuery } = global;

describe("program resources data", function(){

  it("program resource snapshot, org (AGR) and prog (AGR-AAA00)", async ()=> {
    const variables = { 
      dept_code: "AGR",
      program_id: "AGR-AAA00",
    };
    const data = await execQuery(query, variables);
    return expect(data).toMatchSnapshot();
  });

})