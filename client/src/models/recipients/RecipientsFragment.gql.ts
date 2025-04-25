import * as Types from '../../types/types.gql';

import { gql } from '@apollo/client';
export type RecipientsFragmentFragment = { __typename?: 'Recipients', year?: string | null, department?: string | null, org_id?: string | null, program?: string | null, record_type?: string | null, recipient?: string | null, city?: string | null, province?: string | null, country?: string | null, expenditure?: number | null };

export const RecipientsFragmentFragmentDoc = gql`
    fragment RecipientsFragment on Recipients {
  year
  department
  org_id
  program
  record_type
  recipient
  city
  province
  country
  expenditure
}
    `;