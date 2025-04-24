import { make_store } from "src/models/utils/make_store";

type RecipientSummaryDataDef = {
  subject_id: string;
  recipient_summary: {
    subject_id: String;
    recipient_overview: [
      {
        year: string;
        total_tf_exp: number;
      }
    ];
    recipient_exp_summary: [
      {
        year: string;
        recipient: string;
        total_exp: number;
        num_transfer_payments: number;
      }
    ];
  };
};

export const RecipientSummary = make_store(
  ({ subject_id, recipient_summary }: RecipientSummaryDataDef) => ({
    id: subject_id,
    ...recipient_summary,
  })
);
