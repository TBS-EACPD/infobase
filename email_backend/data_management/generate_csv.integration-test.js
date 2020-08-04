import { connect_db } from "../src/db_utils/connect_db";
import { get_templates } from "../src/template_utils";
import { make_mongoose_model_from_original_template } from "../src/db_utils/log_email_and_meta_to_db";
import mongoose from "mongoose";
import axios from "axios";
import { get_output } from "./generate_csv";

//Make sure there is test data to work with
const test_template_name = "test_template.test";
const completed_test_template = {
  enums: ["bug", "other"],
  radio: ["yes"],
  text: "a",
  number: 1,
  json: { bleh: "bleh", a: 1 },

  required_automatic: "blah",
  optional_automatic: "bluh",
};

const instance = axios.create({
  headers: {
    referer: "http://localhost:8080/build/InfoBase/index-eng.html",
  },
});

const post_time = new Date().getTime();
instance
  .post("http://127.0.0.1:7331/submit_email", {
    template_name: test_template_name,
    completed_template: completed_test_template,
  })
  .then(() => {
    const res_time = new Date().getTime();
    const output = get_output().then(console.log);
    console.log(output);
    console.log("test");
  });
