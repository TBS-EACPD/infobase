import _ from "lodash";

const loc_inside_map_view = (coords, circle) => {
  const { coordsNE, coordsSW } = coords;
  const isLongInRange =
    (coordsNE.lng < coordsSW.lng &&
      (circle.lng >= coordsSW.lng || circle.lng <= coordsNE.lng)) ||
    (!(coordsNE.lng < coordsSW.lng) &&
      circle.lng >= coordsSW.lng &&
      circle.lng <= coordsNE.lng);
  return (
    circle.lat >= coordsSW.lat && circle.lat <= coordsNE.lat && isLongInRange
  );
};

export default function (model_singleton) {
  const _records_by_loc_code_location_def = {};
  const all_loc_def_records = [];
  class LocationDef {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { location_code } = obj;
      const inst = new LocationDef(obj);

      if (!_records_by_loc_code_location_def[location_code]) {
        _records_by_loc_code_location_def[location_code] = inst;
      }

      all_loc_def_records.push(inst);
    }
    static get_record_by_loc_code(location_code) {
      return _records_by_loc_code_location_def[location_code];
    }
  }

  const _records_by_loc_code_transfer_payment = {};
  const all_transfer_payment_records = [];
  class TransferPaymentLocationRecord {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static register(obj) {
      const { location_code } = obj;
      const inst = new TransferPaymentLocationRecord(obj);

      if (!_records_by_loc_code_transfer_payment[location_code]) {
        _records_by_loc_code_transfer_payment[location_code] = [];
      }

      _records_by_loc_code_transfer_payment[location_code].push(inst);
      all_transfer_payment_records.push(inst);
    }
    static get_record_by_loc_code(location_code) {
      return _records_by_loc_code_transfer_payment[location_code];
    }
    static get_total_amount(location_code) {
      return parseFloat(
        _.sumBy(_records_by_loc_code_transfer_payment[location_code], "amount")
      );
    }
    static get_records_by_laglng(coords) {
      const filtered_records = all_loc_def_records.filter((rec) =>
        loc_inside_map_view(coords, { lat: rec.lat, lng: rec.lng })
      );
      const codes_in_map_view = _.uniqBy(filtered_records, "location_code").map(
        (rec) => rec.location_code
      );
      const filtered_transfer_payment_records =
        all_transfer_payment_records.filter((rec) =>
          codes_in_map_view.includes(rec.location_code)
        );
      return filtered_transfer_payment_records;
    }
  }

  model_singleton.define("LocationDef", LocationDef);
  model_singleton.define(
    "TransferPaymentLocationRecord",
    TransferPaymentLocationRecord
  );
}
