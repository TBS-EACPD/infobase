import * as Types from '../../../../types/types.gql';

import { gql } from '@apollo/client';
export type IndicatorSummaryFragment = { __typename?: 'Indicator', id?: string | null, name?: string | null, doc?: string | null, target_month?: number | null, target_year?: number | null, target_type?: string | null, target_min?: string | null, target_max?: string | null, seeking_to?: string | null, actual_result?: string | null, status_key?: string | null, result_explanation?: string | null, methodology?: string | null, previous_year_target_type?: string | null, previous_year_target_min?: string | null, previous_year_actual_result?: string | null };

export const IndicatorSummaryFragmentDoc = gql`
    fragment IndicatorSummary on Indicator {
  id
  name
  doc
  target_month
  target_year
  target_type
  target_min
  target_max
  seeking_to
  actual_result
  status_key
  result_explanation
  methodology
  previous_year_target_type
  previous_year_target_min
  previous_year_actual_result
}
    `;