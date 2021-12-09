import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

import { get_static_url, make_request } from "src/request_utils";

import { populate_faq } from "./faq/populate_faq";
import { populate_global_footnotes } from "./footnotes/populate_footnotes";
import { populate_glossary } from "./glossary/populate_glossary";
import {
  populate_depts,
  populate_crsos,
  populate_programs_and_tags,
} from "./subjects/populate_subjects";

import { parse_csv_string_with_undefined_blanks } from "./utils/populate_utils";

export const populate_initial_stores_from_lookups = () =>
  // reminder: the funky .json.js exstension is to ensure that Cloudflare caches these, as it usually won't cache .json
  make_request(get_static_url(`lookups_${lang}.json.js`))
    .then((resp) => resp.text())
    .then((text) => {
      const {
        global_footnotes,
        ...lookup_csv_strings
      }: {
        [x: string]: string;
      } = JSON.parse(text);

      const {
        glossary,
        faq,
        org_to_minister,
        inst_forms,
        ministers,
        ministries,
        igoc,
        url_lookups,
        dept_code_to_csv_name,
        crso,
        program,
        program_tag_types,
        program_tags,
        tags_to_programs,
      } = process_lookups(lookup_csv_strings);

      populate_glossary(glossary);

      populate_faq(faq);

      populate_depts(
        ministries,
        ministers,
        inst_forms,
        igoc,
        url_lookups,
        org_to_minister,
        dept_code_to_csv_name,
        crso
      );

      populate_crsos(crso, igoc, program);

      populate_programs_and_tags(
        program,
        program_tag_types,
        program_tags,
        tags_to_programs
      );

      // outlier for lookups json, a calculated output of the build base script, not a directly stringified csv. Either way,
      // not processed the same as the rest, handled by footnote code
      // Populate last, dynamic run-time footnotes may require Subjects to already be populated
      populate_global_footnotes(global_footnotes);
    });

// TODO, work with pipeline to clean up the headers in igoc_en.csv etc some time, strip the unwanted _en/_fr instances
const MONOLINGUAL_CSVS_WITH_BILINGUAL_HEADERS = ["igoc", "crso", "program"];

const process_lookups = (lookup_csv_strings: { [x: string]: string }) =>
  _.mapValues(lookup_csv_strings, (csv_string, csv_name) =>
    _.chain(csv_string)
      .trim()
      .thru((csv_string) => {
        const csv_string_with_cleaned_headers = _.replace(
          csv_string,
          /^.+\n/,
          (header_row_string) =>
            _.chain(header_row_string)
              .replace(" ", "_")
              .toLower()
              .thru((header_row_string) =>
                _.includes(MONOLINGUAL_CSVS_WITH_BILINGUAL_HEADERS, csv_name)
                  ? _.replace(header_row_string, /"(.*?)_[ef][nr]"/g, '"$1"')
                  : header_row_string
              )
              .value()
        );

        return parse_csv_string_with_undefined_blanks(
          csv_string_with_cleaned_headers
        );
      })
      .value()
  );
