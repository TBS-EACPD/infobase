const headcount_data_tests_fragment = `fragment headcount_data_tests_fragment on HeadcountData {
  data {
    dimension
    year
    headcount
  }
  record {
    dimension
    ppl_last_year_5
    ppl_last_year_4
    ppl_last_year_3
    ppl_last_year_2
    ppl_last_year
  }
  avg_share {
    dimension
    avg_share
  }
  basic_trend {
    first_active_year
    last_active_year
    active_year_count
    avg_share
    avg_headcount
    change_percent
    ppl_last_year_5
    ppl_last_year_4
    ppl_last_year_3
    ppl_last_year_2
    ppl_last_year
  }
}`;

const employee_type_data_gov_all_dim = `
query{
  root(lang: "en"){
    gov{
      employee_type_data(dimension: all_dimensions) {
        ...headcount_data_tests_fragment
      }
    }
  }
}

${headcount_data_tests_fragment}`;

const employee_type_data_dept_all_dim = `
query ($dept_code: String){
  root(lang: "en"){
    org(dept_code: $dept_code){
      employee_type_data(dimension: all_dimensions) {
        ...headcount_data_tests_fragment
      }
    }
  }
}

${headcount_data_tests_fragment}`;

const employee_type_data_gov_one_dim = `
query ($type: Type){
  root(lang: "en"){
    gov{
      employee_type_data(dimension: $type) {
        ...headcount_data_tests_fragment
      }
    }
  }
}

${headcount_data_tests_fragment}`;

const employee_type_data_dept_one_dim = `
query ($dept_code: String, $type: Type){
  root(lang: "en"){
    org(dept_code: $dept_code){
      employee_type_data(dimension: $type) {
        ...headcount_data_tests_fragment
      }
    }
  }
}

${headcount_data_tests_fragment}`;

const emp_type_info_fragment = `fragment emp_type_info_fragment on EmployeeTypeInfo {
  first_active_year
  last_active_year
  active_year_count
  total_avg_headcount
  total_change_percent
  total_ppl_last_year_5
  total_ppl_last_year_4
  total_ppl_last_year_3
  total_ppl_last_year_2
  total_ppl_last_year
}`;

const emp_type_info_gov = `
query{
  root(lang: "en"){
    gov{
      employee_type_info {
        ...emp_type_info_fragment
      }
    }
  }
}

${emp_type_info_fragment}`;

const emp_type_info_dept = `
query ($dept_code: String){
  root(lang: "en"){
    org(dept_code: $dept_code){
      employee_type_info {
        ...emp_type_info_fragment
      }
    }
  }
}

${emp_type_info_fragment}`;



const { execQuery } = global;

describe("people headcount data", function(){
  
  const dept_code = "AGR";

  const type = "stu";

  it("employee type snapshots: gov, all dimensions", async ()=> {
    const data = await execQuery(employee_type_data_gov_all_dim, {});
    return expect(data).toMatchSnapshot();
  });

  it("employee type snapshots: dept, all dimensions", async ()=> {
    const data = await execQuery(employee_type_data_dept_all_dim, {dept_code});
    return expect(data).toMatchSnapshot();
  });

  it("employee type snapshots: gov, one dimension", async ()=> {
    const data = await execQuery(employee_type_data_gov_one_dim, {type});
    return expect(data).toMatchSnapshot();
  });

  it("employee type snapshots: dept, one dimensions", async ()=> {
    const data = await execQuery(employee_type_data_dept_one_dim, {dept_code, type});
    return expect(data).toMatchSnapshot();
  });

  it("people employee type info: gov", async ()=> {
    const data = await execQuery(emp_type_info_gov, {});
    return expect(data).toMatchSnapshot();
  });

  it("people employee type info: dept", async ()=> {
    const data = await execQuery(emp_type_info_dept, {dept_code});
    return expect(data).toMatchSnapshot();
  });
  
});