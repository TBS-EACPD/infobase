import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default function ({ models }) {
  const csv_transfer_payments_by_loc = get_standard_csv_file_rows(
    "transfer_payments_by_loc.csv"
  );
  const csv_location_def = get_standard_csv_file_rows("location_def.csv");

  const location_def = csv_location_def.map((fields) => ({
    ...fields,
    level: parseInt(fields.level),
    lat: parseFloat(fields.latitude),
    lng: parseFloat(fields.longitude),
  }));

  const transfer_payments_by_loc = csv_transfer_payments_by_loc.map(
    (fields) => ({
      ...fields,
      transferpayment: fields.transferpayment_en,
      pa_recipient: fields.pa_recipient_en,
      amount: parseInt(fields.amount),
    })
  );

  const { LocationDef, TransferPaymentLocationRecord } = models;

  _.each(location_def, (def) => LocationDef.register(def));
  _.each(transfer_payments_by_loc, (transfer_payment) =>
    TransferPaymentLocationRecord.register(transfer_payment)
  );
}
