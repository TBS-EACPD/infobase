import { make_store } from "src/models/utils/make_store";

type RecipientsGeneralStatsDataDef = {
  subject_id: string;
  data: [
    {
      year: string;
      org_id: string;
      recipient: string;
      total_exp: number;
      num_transfer_payments: number;
    }
  ];
};

export const RecipientsGeneralStatsDataStore = make_store(
  ({ subject_id, data }: RecipientsGeneralStatsDataDef) => ({
    id: subject_id,
    subject_id,
    data,
  })
);
