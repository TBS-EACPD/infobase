import { make_store } from "src/models/utils/make_store";

type RecipientReportYearsDataDef = {
  subject_id: string;
  report_years: [string];
};

export const RecipientReportYears = make_store(
  ({ subject_id, report_years }: RecipientReportYearsDataDef) => ({
    id: subject_id,
    report_years,
  })
);
