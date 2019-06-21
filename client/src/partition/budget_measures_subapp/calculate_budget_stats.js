import { Subject } from '../../models/subject';
import { businessConstants } from '../../models/businessConstants.js';

const { BudgetMeasure } = Subject;

const { budget_values } = businessConstants;

const calculate_budget_stats = (year) => {
  const all_budget_measures = _.filter(
    BudgetMeasure.get_all(),
    measure => measure.year === year
  );

  const reduce_by_budget_value = (data) => _.chain(budget_values)
    .keys()
    .map( key => [
      key,
      _.reduce(data, (memo, data_row) => memo + data_row[key], 0),
    ])
    .fromPairs()
    .value();
  const rolled_up_data_rows = _.map(
    all_budget_measures,
    budget_measure => reduce_by_budget_value(budget_measure.data)
  );

  const total_allocations_by_programs_and_internal_services = _.chain(all_budget_measures)
    .flatMap( budget_measure => _.map(
      budget_measure.data, 
      data_row => _.map(
        data_row.program_allocations,
        ({subject_id, allocated}) => [subject_id, allocated] 
      )
    ))
    .filter( program_allocation_pairs => !_.isEmpty(program_allocation_pairs) )
    .flatten()
    .groupBy( program_allocation_pairs => /ISS/.test(program_allocation_pairs[0]) ?
      "internal_services" :
      "programs"
    )
    .mapValues( grouped_program_allocation_pairs => _.chain(grouped_program_allocation_pairs)
      .groupBy( program_allocation_pair => program_allocation_pair[0] )
      .mapValues( program_allocation_pairs => _.reduce(
        program_allocation_pairs, 
        (sum, program_allocation_pair) => sum + program_allocation_pair[1], 
        0
      ))
      .value()
    )
    .value();

  const funding_data_totals = reduce_by_budget_value(rolled_up_data_rows);

  const measure_count = all_budget_measures.length;
  const multiple_measures = measure_count > 1;

  const vote_count = year === "2018" ? 1 : _.flatMap(all_budget_measures, 'data').length;
  const multiple_votes = vote_count > 1;
  
  const allocated_to_measure_count = _.filter(rolled_up_data_rows, data_row => data_row.allocated ).length;

  const allocated_to_program_count = _.size(total_allocations_by_programs_and_internal_services.programs);

  const allocated_to_internal_services_count = _.size(total_allocations_by_programs_and_internal_services.internal_services);

  const allocated_to_all_program_count = allocated_to_program_count + allocated_to_internal_services_count;

  const total_internal_service_allocated = _.reduce(
    total_allocations_by_programs_and_internal_services.internal_services,
    (sum, internal_service_total_allocation) => sum + internal_service_total_allocation,
    0
  );
  
  const no_remaining_funds_count = _.filter(
    rolled_up_data_rows,
    data_row => data_row.remaining === 0
  ).length;

  const fully_withheld_funds_count = _.filter(
    rolled_up_data_rows,
    data_row => data_row.funding !== 0 && (data_row.funding === data_row.withheld)
  ).length;

  const totally_funded_count = no_remaining_funds_count - fully_withheld_funds_count;

  const less_one_percent_remaining_funds_count = _.chain(rolled_up_data_rows)
    .filter( data_row => data_row.remaining !== 0 )
    .map( data_row => Math.abs(data_row.remaining/data_row.funding) )
    .filter( percent_remaining => percent_remaining < 0.01 )
    .value()
    .length;

  return {
    measure_count,
    multiple_measures,
    vote_count,
    multiple_votes,
    total_funding: funding_data_totals.funding,
    total_allocated: funding_data_totals.allocated,
    total_allocated_share: funding_data_totals.allocated/funding_data_totals.funding,
    total_withheld: funding_data_totals.withheld,
    total_withheld_share: funding_data_totals.withheld/funding_data_totals.funding,
    total_remaining: funding_data_totals.remaining,
    total_remaining_share: funding_data_totals.remaining/funding_data_totals.funding,
    allocated_to_measure_count,
    allocated_to_all_program_count,
    allocated_to_internal_services_count,
    total_internal_service_allocated,
    totally_funded_count,
    fully_withheld_funds_count,
    less_one_percent_remaining_funds_count,
  };
};

export { calculate_budget_stats };