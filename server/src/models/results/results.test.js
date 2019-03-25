import _ from 'lodash';
const { execQuery } = global;

const dept_results_data_query = `
query entire_4_orgs {
	root(lang:"en") {
    tbs: org(org_id:"326") {
      ...everything
    }
    dnd: org(org_id:"133") {
      ...everything
    }
    polar: org(org_id:"552") {
      ...everything
    }
    bank: org(org_id:"15") {
      ...everything
    }
  }
}

fragment result_and_indicator_fields on Result {
  id
  parent_id
  name
  doc

  indicators {
    result_id
    name
    
    target_year
    target_month
    target_type
    target_min
    target_max
    target_narrative
    doc
    
    explanation
    
    actual_result
    actual_datatype
    actual_result
    
    status_key
    
    methodology
    measure
  }
}
fragment everything on Org {
  id
  has_results
  crsos {
    id
    has_results
    programs {
      id
      has_results
      results(doc: "drr17") {
        ...result_and_indicator_fields
      }
      sub_programs {
        results(doc: "drr17") {
          ...result_and_indicator_fields
        }
      }
    }
    results(doc: "dp18") {
      ...result_and_indicator_fields
    }
  }
}
`;

const all_results_counts_query = `
query results_counts {
	root(lang:"en") {
    gov {
      all_target_counts_summary {
        subject_id
        drr17_results
        drr17_indicators_met
        drr17_indicators_not_available
        drr17_indicators_not_met
        drr17_indicators_future
        dp18_results
        dp18_indicators
      }
    }
  }
}
`;
const dept_results_count_query = `
query test_org_count {
	root(lang:"en") {
    TBC: org(org_id:"326") {
      id
      ...everything
    }
    ND: org(org_id:"133") {
      id
      ...everything
    }
    CPCC: org(org_id:"552") {
      id
      ...everything
    }
  }
}

fragment result_counts on ResultCount {
  results

  indicators_dp

  indicators_met
  indicators_not_available
  indicators_not_met
  indicators_future
}
fragment everything on Org {
  drr17: target_counts(doc: "drr17") {
    ...result_counts
  }
  dp18: target_counts(doc: "dp18") {
    ...result_counts
  }
}
`;

describe("results data", function(){

  it("Test departments result snapshot", async () => {
    const data = await execQuery(dept_results_data_query);
    return expect(data).toMatchSnapshot();
  });

  it("Test departments ResultCount snapshot", async () => {
    const dept_result_counts = await execQuery(dept_results_count_query);
    return expect(dept_result_counts).toMatchSnapshot();
  });

  it("Test that AllDocResultCount match rolled up ResultCount values", async () => {
    const all_result_counts_result = await execQuery(all_results_counts_query);
    const dept_result_counts_result = await execQuery(dept_results_count_query);
    
    const counts_by_dept_code = _.chain(all_result_counts_result.data.root.gov.all_target_counts_summary)
      .map( counts => [counts.subject_id, counts] )
      .fromPairs()
      .value();

    const combine_docs_and_rekey = ({id, drr17, dp18}) => _.mapValues(
      {
        subject_id: id,
        ..._.chain(drr17)
          .omit("indicators_dp")
          .map( (value, key) => [`drr17_${key}`, value] )
          .fromPairs()
          .value(),
        dp18_results: dp18.results,
        dp18_indicators: dp18.indicators_dp,
      },
      (value) => value === 0 ? null : value 
    );

    const result_counts_match = _.chain(dept_result_counts_result.data.root)
      .mapValues( combine_docs_and_rekey )
      .every(
        (counts) => _.isEqual(counts_by_dept_code[counts.subject_id], counts)
      )
      .value();
   
    return expect(result_counts_match).toEqual(true);
  });
});