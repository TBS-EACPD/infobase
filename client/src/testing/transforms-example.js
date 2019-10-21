import yaml_module from './sample_yaml.yaml';
import csv_str from './sample_csv.csv';
import d3 from '../app_bootstrap/d3-bundle';

export const get_yaml_content = ()=>{
  return yaml_module;
};

export const get_parsed_csv = ()=>{
  return d3.csvParse(csv_str);
};