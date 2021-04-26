import _ from "lodash";

const drr_docs_to_test = ["drr17"];
const dp_docs_to_test = ["dp18", "dp19"];

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
    doc
    
    target_year
    target_month

    target_type
    target_min
    target_max
    target_narrative
    measure
    seeking_to
    target_change

    previous_year_target_type
    previous_year_target_min
    previous_year_target_max
    previous_year_target_narrative
    previous_year_measure
    previous_year_seeking_to
    previous_year_target_change

    target_explanation
    result_explanation
    
    actual_result
    
    status_key
    
    methodology
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
    }

    dp18_results: results(doc: "dp18") {
      ...result_and_indicator_fields
    }

    dp19_results: results(doc: "dp19") {
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

        dp19_results
        dp19_indicators
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
  dp19: target_counts(doc: "dp19") {
    ...result_counts
  }
}
`;

describe("results data", function () {
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

    const counts_by_dept_code = _.chain(
      all_result_counts_result.data.root.gov.all_target_counts_summary
    )
      .map((counts) => [counts.subject_id, counts])
      .fromPairs()
      .value();

    const combine_docs_and_rekey = (dept_query_response) =>
      _.mapValues(
        {
          subject_id: dept_query_response.id,
          ..._(drr_docs_to_test)
            .flatMap((drr_doc) =>
              _.chain(dept_query_response[drr_doc])
                .omit("indicators_dp")
                .map((value, key) => [`${drr_doc}_${key}`, value])
                .fromPairs()
                .value()
            )
            .reduce(
              (all_drr_doc_counts, drr_doc_counts) => ({
                ...all_drr_doc_counts,
                ...drr_doc_counts,
              }),
              {}
            ),
          ..._(dp_docs_to_test)
            .flatMap((dp_doc) => ({
              [`${dp_doc}_results`]: dept_query_response[dp_doc].results,
              [`${dp_doc}_indicators`]: dept_query_response[dp_doc]
                .indicators_dp,
            }))
            .reduce(
              (all_dp_doc_counts, dp_doc_counts) => ({
                ...all_dp_doc_counts,
                ...dp_doc_counts,
              }),
              {}
            ),
        },
        (value) => (value === 0 ? null : value)
      );

    const result_counts_match = _(dept_result_counts_result.data.root)
      .mapValues(combine_docs_and_rekey)
      .every((counts) =>
        _.isEqual(counts_by_dept_code[counts.subject_id], counts)
      );

    return expect(result_counts_match).toEqual(true);
  });
});
