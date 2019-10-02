import { csvParse } from "d3-dsv";

import csv_str from "./sample_csv.csv";

import yaml_module from "./sample_yaml.yaml";

export const get_yaml_content = () => {
  return yaml_module;
};

export const get_parsed_csv = () => {
  return csvParse(csv_str);
};
