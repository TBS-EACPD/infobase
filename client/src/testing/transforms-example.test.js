import { get_yaml_content, get_parsed_csv } from './transforms-example.js';
import yaml_content from './sample_yaml.yaml';


const sample_text_entry_matcher = {
  __file_name__:"/src/testing/sample_yaml.yaml",
  some_key: {
    en: "some value",
    fr: "le multiline vàlûe\n",
  },
};

test("yaml import work within test modules themselves",()=>{
  expect(yaml_content).toEqual(sample_text_entry_matcher);
});

test("yaml import work within tested modules",()=>{
  const content = get_yaml_content();
  expect(content).toEqual(sample_text_entry_matcher);
});

test("csv works in test env",()=>{
  const content = get_parsed_csv();
  expect(content[0]).toEqual({
    key: "some_key",
    en: "a value",
    fr: "ûne valeur",
  });
});