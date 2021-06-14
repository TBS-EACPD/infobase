import { bilingual_field } from "../schema_utils.js";

const schema = `

  extend type Root {
    location_def(code: String): LocationDefRecord
    transfer_payment_location(code: String): TransferPayment
    transfer_payment_in_map(coords: MapViewBounds): [TransferPaymentLocationRecord]
  }

  input MapViewBounds {
    coordsNE: LatLng
    coordsSW: LatLng
  }

  input LatLng {
    lat: Float
    lng: Float
  }

  type LocationDefRecord {
    level: Int
    name: String
    location_code: String
    lat: Float
    lng: Float
    total_amount: Float
    transfer_payment_location_records: [TransferPaymentLocationRecord]
  }

  type TransferPayment {
    location_def: LocationDefRecord
    transfer_payment_location_records: [TransferPaymentLocationRecord]
  }

  type TransferPaymentLocationRecord {
    id: String
    situation: String
    level: String
    fyear: String
    deptcode: String
    transferpayment: String
    pa_recipient: String
    amount: Int
    city: String
    province: String
    country: String
    location_code: String
  }
  
`;

export default function ({ models }) {
  const { LocationDef, TransferPaymentLocationRecord } = models;

  const resolvers = {
    Root: {
      location_def: (parent, { code }) => {
        return {
          ...LocationDef.get_record_by_loc_code(code),
          transfer_payment_location_records:
            TransferPaymentLocationRecord.get_record_by_loc_code(code),
          total_amount: TransferPaymentLocationRecord.get_total_amount(code),
        };
      },
      transfer_payment_location: (parent, { code }) => {
        return {
          transfer_payment_location_records:
            TransferPaymentLocationRecord.get_record_by_loc_code(code),
          location_def: LocationDef.get_record_by_loc_code(code),
        };
      },
      transfer_payment_in_map: (parent, { coords }) => {
        return TransferPaymentLocationRecord.get_records_by_laglng(coords);
      },
    },
    LocationDefRecord: {
      name: bilingual_field("name"),
    },
  };

  return {
    schema,
    resolvers,
  };
}
