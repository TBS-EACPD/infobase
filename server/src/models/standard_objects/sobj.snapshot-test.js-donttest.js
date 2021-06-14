import _ from "lodash";

const fragments = `
fragment sobj_info on StandardObjectData {
  pa_last_year_data: data(year: "pa_last_year"){
    so_num
    year
    amount
  }
  personel_data: data(so_num:1){
    so_num
    year
    amount
  }
  personel_last_year_data: data(so_num:1, year: "pa_last_year"){
    so_num
    year
    amount
  }
  top_n_with_other(n: 3, year: "pa_last_year"){
    so_num
    year
    amount
  }

  
}
`;

const org_query = `
query sobj_test_org_query($dept_code: String){
  root(lang: "en"){
    org(dept_code: $dept_code){
      standard_object_data {
        ...sobj_info
      }
    }
  }
}
${fragments}
`;

const prog_query = `
query sobj_test_prog_query($program_id: String){
  root(lang: "en"){
    program(id:$program_id){
      standard_object_data {
        ...sobj_info
      }
    }
  }
}

${fragments}
`;

const { execQuery } = global;

describe("SOBJ data", function () {
  it("SOBJ org (agr) snapshot", async () => {
    const variables = { dept_code: "AGR" };
    const data = await execQuery(org_query, variables);
    return expect(data).toMatchSnapshot();
  });

  it("org-level sobj top-3 should sum up to all data", async () => {
    const vars = { dept_code: "AGR" };
    const { data } = await execQuery(org_query, vars);
    const { top_n_with_other, pa_last_year_data } =
      data.root.org.standard_object_data;
    const sum_top = _.sumBy(top_n_with_other, "amount");
    const sum_all = _.sumBy(pa_last_year_data, "amount");
    expect(sum_top).toBeCloseTo(sum_all);
  });

  it("SOBJ: program (AGR-AAA00) snapshot", async () => {
    const variables = { program_id: "AGR-AAA00" };
    const data = await execQuery(prog_query, variables);
    return expect(data).toMatchSnapshot();
  });
});
