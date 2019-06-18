import { 
  validate_completed_template,
  verify_meta_unchanged,
  verify_required_fields_present,
  verify_values_match_value_types,
  verify_no_unexpected_fields,
} from 'validate_Completed_template.js'
import _ from 'lodash';

describe("Validation of completed templates", () => {

  it("verify_meta_unchanged checks deep equality of meta objects", () => {
    const meta_one = {
      subject_template: "bleh",
    };
    const meta_one_prime = {
      subject_template: "bleh",
    };
    const meta_two = {
      subject_template: "bleh",
      blah: "bluh",
    };
    const meta_three = {
      subject_template: "bluh",
    };

    return expect(
      verify_meta_unchanged(meta_one, meta_one_prime),
      verify_meta_unchanged(meta_one, meta_two),
      verify_meta_unchanged(meta_one, meta_three)
    ).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("verify_required_fields_present", () => {
    return false;
  });

  it("verify_values_match_value_types", () => {
    return false;
  });

  it("verify_no_unexpected_fields", () => {
    return false;
  });

  it("validate_completed_template works end-to-end", () => {
    return false;
  });

});